import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProjectDto } from './dto/update-project.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, dto: CreateProjectDto) {
    console.log(userId);
    return this.prisma.project.create({
      data: {
        name: dto.name,
        description: dto.description,
        ownerId: userId,
      },
    });
  }
  async findAll() {
    const all = await this.prisma.project.findMany();
    if (all.length === 0) throw new NotFoundException('No projects found');
    return all;
  }

  async findAllByUser(userId: number) {
    const all = await this.prisma.project.findMany({
      where: { ownerId: userId },
    });
    if (all.length === 0) throw new NotFoundException('No projects found');
    return all;
  }
  async findOne(projectId: number, userId: number) {
    console.log('projId:', projectId, typeof projectId);
    const proj = await this.prisma.project.findUnique({
      where: { id: projectId, ownerId: userId },
    });
    if (!proj) throw new NotFoundException('Project not found');
    return proj;
  }

  async update(userId: number, updateDto: UpdateProjectDto) {
    const { id, ...data } = updateDto;
    console.log(data);
    const project = await this.prisma.project.findUnique({
      where: {
        id,
        ownerId: userId,
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found or not yours');
    }

    return this.prisma.project.update({
      where: { id },
      data,
    });
  }
}
