import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CacheHelper } from 'src/common/cache/cache.helper';
import { ProjectGateway } from 'src/gateway/project.gateway';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    private projectGateway: ProjectGateway,
  ) {}

  async create(userId: number, createDto: CreateProjectDto) {
    if (!createDto.name) throw new NotFoundException('no project name');

    return this.prisma.$transaction(async (tx) => {
      const project = await tx.project.create({
        data: {
          name: createDto.name,
          description: createDto.description,
          wipLimit: createDto.wipLimit,
          ownerId: userId,
        },
      });

      // Seed the owner as a ProjectMember so all membership-based
      // checks (task access, invite generation, etc.) work uniformly
      // for owners and joined members alike.
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          memberId: userId,
          role: 'OWNER',
        },
      });

      await this.cacheHelper.invalidate(
        'all_projects',
        `projects_user_${userId}`,
      );
      return project;
    });
  }

  async findAll() {
    return this.cacheHelper.getOrSet('all_projects', async () => {
      const all = await this.prisma.project.findMany();
      if (all.length === 0) throw new NotFoundException('No projects found');
      return all;
    });
  }

  // Now returns owned AND joined projects, not just owned ones.
  async findAllByUser(userId: number) {
    return this.cacheHelper.getOrSet(`projects_user_${userId}`, () =>
      this.prisma.project.findMany({
        where: {
          members: {
            some: { memberId: userId },
          },
        },
      }),
    );
  }

  // Any member (owner or joined) can view the project.
  async findOne(projectId: number, userId: number) {
    const proj = await this.prisma.project.findFirst({
      where: {
        id: projectId,
        members: {
          some: { memberId: userId },
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
    const membership = await this.prisma.projectMember.findUnique({
      where: { projectId_memberId: { projectId, memberId: userId } },
    });
    if (!membership) throw new NotFoundException('Project not found');

    return this.prisma.projectMember.findMany({
      where: { projectId },
      include: {
        member: {
          select: { id: true, user_id: true, username: true, email: true },
        },
      },
      orderBy: { joinedAt: 'asc' },
    });
  }
}
