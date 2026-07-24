import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { CacheHelper } from '../common/cache/cache.helper';

@Injectable()
export class ChangelogService {
  constructor(
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
  ) {}

  // callerId/callerUserId come from the authenticated request (JWT), never
  // from the body — dto.user_id is still accepted for contract compatibility
  // but intentionally ignored for the actual write, so a caller can't forge
  // a changelog entry attributed to someone else.
  async create(
    createDto: CreateChangelogDto,
    callerId: number,
    callerUserId: string,
  ) {
    const task = await this.prisma.task.findUnique({
      where: { id: createDto.task_id },
      select: { id: true, title: true, projectId: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: { projectId: task.projectId, memberId: callerId },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    return this.prisma.changeLog.create({
      data: {
        taskId: createDto.task_id,
        taskTitle: task.title,
        username: callerUserId,
        field: 'status',
        oldValue: createDto.old_status,
        newValue: createDto.new_status,
        remark: createDto.remark ?? null,
      },
    });
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

  async findByProjectId(
    projectId: number,
    cursor?: number,
    limit: number = 10,
    filterField?: string,
  ) {
    const cacheKey = `changelog_project_${projectId}_${cursor ?? 'start'}_${filterField ?? 'all'}`;

    return this.cacheHelper.getOrSet(
      cacheKey,
      async () => {
        const logs = await this.prisma.changeLog.findMany({
          where: {
            task: { projectId },
            ...(filterField && filterField !== 'all'
              ? { field: filterField }
              : {}),
          },
          orderBy: { createdAt: 'desc' },
          take: limit + 1, // fetch one extra to know if there's more
          ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
          include: {
            task: { select: { id: true, title: true } },
            member: { select: { user_id: true, username: true } },
          },
        });

        const hasMore = logs.length > limit;
        const items = hasMore ? logs.slice(0, limit) : logs;
        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return { items, nextCursor, hasMore };
      },
      15000,
    );
  }
}
