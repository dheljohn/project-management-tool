import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { CacheHelper } from '../common/cache/cache.helper';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';
import { Task } from '../../database/src/Entities/task.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';

@Injectable()
export class ChangelogService {
  constructor(
    // private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    @InjectRepository(ChangeLog)
    private readonly changeLogRepo: Repository<ChangeLog>,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
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
    const task = await this.taskRepo.findOne({
      where: { id: createDto.task_id },
      select: { id: true, title: true, projectId: true },
    });
    if (!task) throw new NotFoundException('Task not found');

    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId: task.projectId,
        memberId: callerId,
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    return this.changeLogRepo.create({
      taskId: createDto.task_id,
      taskTitle: task.title,
      username: callerUserId,
      field: 'status',
      oldValue: createDto.old_status,
      newValue: createDto.new_status,
      remark: createDto.remark ?? null,
    });
  }

  async findAll() {
    return this.changeLogRepo.find({
      order: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const changelog = await this.changeLogRepo.findOne({ where: { id } });
    if (!changelog) throw new NotFoundException('Changelog not found');
    return changelog;
  }

  async update(updateDto: UpdateChangelogDto) {
    const log = await this.changeLogRepo.findOne({
      where: { id: updateDto.id },
    });
    if (!log) throw new NotFoundException('Changelog not found');

    return this.changeLogRepo.update(
      { id: updateDto.id },
      {
        ...(updateDto.remark !== undefined && { remark: updateDto.remark }),
      },
    );
  }

  // async findByProjectId(
  //   projectId: number,
  //   cursor?: number,
  //   limit: number = 10,
  //   filterField?: string,
  // ) {
  //   const cacheKey = `changelog_project_${projectId}_${cursor ?? 'start'}_${filterField ?? 'all'}`;

  //   return this.cacheHelper.getOrSet(
  //     cacheKey,
  //     async () => {
  //       // const logs = await this.prisma.changeLog.findMany({
  //       //   where: {
  //       //     task: { projectId },
  //       //     ...(filterField && filterField !== 'all'
  //       //       ? { field: filterField }
  //       //       : {}),
  //       //   },
  //       //   orderBy: { createdAt: 'desc' },
  //       //   take: limit + 1, // fetch one extra to know if there's more
  //       //   ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  //       //   include: {
  //       //     task: { select: { id: true, title: true } },
  //       //     member: { select: { user_id: true, username: true } },
  //       //   },
  //       // });
  //       const logs = await this.changeLogRepository.find({
  //         where: {
  //           task: { projectId },
  //           ...(filterField && filterField !== 'all'
  //             ? { field: filterField }
  //             : {}),
  //         },
  //         order: { createdAt: 'desc' },
  //         take: limit + 1, // fetch one extra to know if there's more
  //         ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
  //         relations: {
  //           task: true,
  //           member: true,
  //         },
  //       });

  //       const hasMore = logs.length > limit;
  //       const items = hasMore ? logs.slice(0, limit) : logs;
  //       const nextCursor = hasMore ? items[items.length - 1].id : null;

  //       return { items, nextCursor, hasMore };
  //     },
  //     15000,
  //   );
  // }
  async findByProjectId(
    projectId: number,
    cursor?: number,
    limit = 10,
    filterField?: string,
  ) {
    const cacheKey = `changelog_project_${projectId}_${cursor ?? 'start'}_${filterField ?? 'all'}_${limit}`;

    return this.cacheHelper.getOrSet(
      cacheKey,
      async () => {
        const qb = this.changeLogRepo
          .createQueryBuilder('log')
          .leftJoinAndSelect('log.task', 'task')
          .leftJoinAndSelect('log.member', 'member')
          .where('task.projectId = :projectId', {
            projectId,
          })
          .orderBy('log.createdAt', 'DESC')
          .addOrderBy('log.id', 'DESC')
          .take(limit + 1);

        if (filterField && filterField !== 'all') {
          qb.andWhere('log.field = :field', {
            field: filterField,
          });
        }

        if (cursor) {
          const cursorLog = await this.changeLogRepo.findOne({
            where: {
              id: cursor,
            },
          });

          if (!cursorLog) {
            throw new NotFoundException('Invalid cursor');
          }

          qb.andWhere(
            `(log.createdAt < :createdAt
            OR (log.createdAt = :createdAt AND log.id < :id))`,
            {
              createdAt: cursorLog.createdAt,
              id: cursorLog.id,
            },
          );
        }

        const logs = await qb.getMany();

        const hasMore = logs.length > limit;

        const items = hasMore ? logs.slice(0, limit) : logs;

        const nextCursor = hasMore ? items[items.length - 1].id : null;

        return {
          items,
          nextCursor,
          hasMore,
        };
      },
      15000,
    );
  }
}
