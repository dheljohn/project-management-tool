import { Injectable, NotFoundException, Inject } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProjectDto } from './dto/update-project.dto';
import { CacheHelper } from 'src/common/cache/cache.helper';

@Injectable()
export class ProjectsService {
  constructor(
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
  ) {}

  async create(userId: number, createDto: CreateProjectDto) {
    if (!createDto.name) throw new NotFoundException('no project name');
    const project = await this.prisma.project.create({
      data: {
        name: createDto.name,
        description: createDto.description,
        wipLimit: createDto.wipLimit,
        ownerId: userId,
      },
    });

    await this.cacheHelper.invalidate(
      'all_projects',
      `projects_user_${userId}`,
    );
    return project;
  }

  async findAll() {
    return this.cacheHelper.getOrSet('all_projects', async () => {
      const all = await this.prisma.project.findMany();
      if (all.length === 0) throw new NotFoundException('No projects found');
      return all;
    });
  }

  async findAllByUser(userId: number) {
    return this.cacheHelper.getOrSet(`projects_user_${userId}`, () =>
      this.prisma.project.findMany({ where: { ownerId: userId } }),
    );
  }

  async findOne(projectId: number, userId: number) {
    const proj = await this.prisma.project.findUnique({
      where: { id: projectId, ownerId: userId },
    });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }

  async update(userId: number, updateDto: UpdateProjectDto) {
    const { id, ...data } = updateDto;

    const project = await this.prisma.project.findUnique({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or not yours');
    }

    const updated = await this.prisma.project.update({
      where: { id },
      data,
    });

    await this.cacheHelper.invalidate(
      'all_projects',
      `projects_user_${userId}`,
    );
    return updated;
  }
}
