import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
@Injectable()
export class ChangelogService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateChangelogDto) {
    const changelog = await this.prisma.changeLog.create({
      data: {
        taskId: createDto.task_id,
        username: createDto.user_id,
        field: 'status',
        oldValue: createDto.old_status,
        newValue: createDto.new_status,
        remark: createDto.remark ?? null,
      },
    });
    return changelog;
  }

  async findAll() {
    return this.prisma.changeLog.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const changelog = await this.prisma.changeLog.findUnique({ where: { id } });
    if (!changelog) throw new NotFoundException('Changelog not found');
    return changelog;
  }

  async update(updateDto: UpdateChangelogDto) {
    const log = await this.prisma.changeLog.findUnique({
      where: { id: updateDto.id },
    });
    if (!log) throw new NotFoundException('Changelog not found');

    return this.prisma.changeLog.update({
      where: { id: updateDto.id },
      data: {
        ...(updateDto.remark !== undefined && { remark: updateDto.remark }),
      },
    });
  }

  async findByProjectId(projectId: number) {
    return this.prisma.changeLog.findMany({
      where: { task: { projectId: projectId } },
      include: {
        task: { select: { id: true, title: true, projectId: true } },
        member: { select: { user_id: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}
