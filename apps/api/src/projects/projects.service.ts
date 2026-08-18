import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
// import { PrismaService } from '../prisma/prisma.service';
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
    private readonly projectRepo: Repository<Project>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,

    private readonly dataSource: DataSource,
    // private prisma: PrismaService,
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

  async findAll() {
    return this.cacheHelper.getOrSet('all_projects', async () => {
      const all = await this.projectRepo.find();
      if (all.length === 0) throw new NotFoundException('No projects found');
      return all;
    });
  }

  async findAllByUser(userId: number) {
    return this.cacheHelper.getOrSet(`projects_user_${userId}`, async () => {
      const [owned, membership] = await Promise.all([
        this.projectRepo.findBy({ ownerId: userId }),
        this.projectMemberRepo.find({
          where: { memberId: userId },
          relations: { project: true },
        }),
      ]);
      const memberProjects = membership.map((m) => m.project);
      const combined = [...owned, ...memberProjects];
      return Array.from(new Map(combined.map((p) => [p.id, p])).values());
    });
  }

  async findOne(projectId: number, userId: number) {
    const proj = await this.projectRepo.findOne({
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

    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId: id,
        memberId: userId,
      },
    });

    if (!membership) {
      throw new NotFoundException('Project not found');
    }
    if (membership.role !== ProjectRole.OWNER) {
      throw new ForbiddenException(
        'Only the project owner can update this project',
      );
    }

    const result = await this.projectRepo.update({ id }, data);

    if (result.affected === 0) {
      throw new NotFoundException('Project not found');
    }
    const updated = await this.projectRepo.findOneOrFail({
      where: { id },
    });

    await this.cacheHelper.invalidate(
      'all_projects',
      `projects_user_${userId}`,
    );

    this.projectGateway.emitToProject(id, 'project:updated', {
      project: updated,
      updatedBy: userId,
    });

    return updated;
  }

  async listMembers(userId: number, projectId: number) {
    const membership = await this.projectMemberRepo.findOne({
      where: { memberId: userId },
    });
    if (!membership) throw new NotFoundException('Project not found');

    return this.projectMemberRepo.find({
      where: { projectId },
      relations: { member: true },
      order: { joinedAt: 'asc' },
    });
  }
}
