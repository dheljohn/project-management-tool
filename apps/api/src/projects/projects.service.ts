import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CacheHelper } from '../common/cache/cache.helper';
import { ProjectGateway } from '../gateway/project.gateway';
import { InjectRepository } from '@nestjs/typeorm';
import { Project } from '../../database/src/Entities/project.entity';
import { DataSource, Repository } from 'typeorm';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
import { ProjectRole } from '../../database/enums/project-role.enum';
// import { ProjectRole } from '../../generated/prisma/enums';

@Injectable()
export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepository: Repository<ProjectMember>,

    private readonly dataSource: DataSource,
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    private projectGateway: ProjectGateway,
  ) {}

  async create(userId: number, createDto: CreateProjectDto) {
    if (!createDto.name) throw new NotFoundException('no project name');

    return this.dataSource.transaction(async (manager) => {
      const projectRepo = manager.getRepository(Project);
      const memberRepo = manager.getRepository(ProjectMember);
      console.log('Attempting to create project for userId:', userId);

      // Check if this ID actually exists in your DB
      const project = await projectRepo.save(
        projectRepo.create({
          name: createDto.name,
          description: createDto.description,
          wipLimit: createDto.wipLimit,
          ownerId: userId,
        }),
      );
      console.log('DATAA', project);

      await memberRepo.save(
        memberRepo.create({
          projectId: project.id,
          memberId: userId,
          role: ProjectRole.OWNER,
        }),
      );

      await this.cacheHelper.invalidate(
        'all_projects',
        `projects_user_${userId}`,
      );
      return project;
    });
  }
  // async create(userId: number, createDto: CreateProjectDto) {
  //   if (!createDto.name) throw new NotFoundException('no project name');

  //   return this.dataSource.transaction(async (manager) => {
  //     const projectRepo = manager.getRepository(Project);
  //     const memberRepo = manager.getRepository(ProjectMember);
  //     const memberModelRepo = manager.getRepository(Member);
  //     console.log('Attempting to create project for userId:', userId);

  //     // Check if this ID actually exists in your DB
  //     const member = await memberModelRepo.findOne({ where: { userId } });
  //     if (!member) {
  //       throw new NotFoundException('member not found');
  //     }
  //     const project = await projectRepo.save(
  //       projectRepo.create({
  //         name: createDto.name,
  //         description: createDto.description,
  //         wipLimit: createDto.wipLimit,
  //         ownerId: userId,
  //       }),
  //     );
  //     // console.log('DATAA', project);

  //     await memberRepo.save(
  //       memberRepo.create({
  //         projectId: project.id,
  //         memberId: userId,
  //         role: ProjectRole.OWNER,
  //       }),
  //     );

  //     await this.cacheHelper.invalidate(
  //       'all_projects',
  //       `projects_user_${userId}`,
  //     );
  //     return project;
  //   });
  // }

  async findAll() {
    return this.cacheHelper.getOrSet('all_projects', async () => {
      const all = await this.projectRepository.find();
      if (all.length === 0) throw new NotFoundException('No projects found');
      return all;
    });
  }

  // Now returns owned AND joined projects, not just owned ones.
  async findAllByUser(userId: number) {
    return this.cacheHelper.getOrSet(`projects_user_${userId}`, async () => {
      // this.projectRepository.findBy({
      //   ownerId: userId,
      // }),
      const [owned, membership] = await Promise.all([
        this.projectRepository.findBy({ ownerId: userId }),
        this.projectMemberRepository.find({
          where: { memberId: userId },
          relations: { project: true },
        }),
      ]);
      const memberProjects = membership.map((m) => m.project);
      const combined = [...owned, ...memberProjects];
      return Array.from(new Map(combined.map((p) => [p.id, p])).values());
    });
  }

  // Any member (owner or joined) can view the project.
  // async findOne(projectId: number, userId: number) {
  //   const proj = await this.prisma.project.findFirst({
  //     where: {
  //       id: projectId,
  //       members: {
  //         some: { memberId: userId },
  //       },
  //     },
  //   });
  //   if (!proj) throw new NotFoundException('Project not found');
  //   return proj;
  // }
  async findOne(projectId: number, userId: number) {
    const proj = await this.projectRepository.findOne({
      where: {
        id: projectId,
        members: {
          memberId: userId,
        },
      },
    });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }

  async update(userId: number, updateDto: UpdateProjectDto) {
    const { id, ...data } = updateDto;

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: { projectId: id, memberId: userId },
      },
    });

    if (!membership) {
      throw new NotFoundException('Project not found');
    }
    if (membership.role !== 'OWNER') {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data,
    });

    await this.cacheHelper.invalidate(
      'all_projects',
      `projects_user_${userId}`,
    );

    this.projectGateway.emitToProject(updated.id, 'project:updated', {
      project: updated,
      updatedBy: userId,
    });

    return updated;
  }

  async listMembers(userId: number, projectId: number) {
    const membership = await this.projectMemberRepository.findOne({
      where: { memberId: userId },
    });
    if (!membership) throw new NotFoundException('Project not found');

    // return this.prisma.projectMember.findMany({
    //   where: { projectId },
    //   include: {
    //     member: {
    //       select: { id: true, user_id: true, username: true, email: true },
    //     },
    //   },
    //   orderBy: { joinedAt: 'asc' },
    // });
    return this.projectMemberRepository.find({
      where: { projectId },
      relations: { member: true },
      order: { joinedAt: 'asc' },
    });
  }
}
