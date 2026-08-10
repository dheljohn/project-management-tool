import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Priority, TaskStatus } from '../../generated/prisma/enums';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheHelper } from '../common/cache/cache.helper';
import { ProjectGateway } from '../gateway/project.gateway';
import { Prisma } from '../../generated/prisma/client';
// import { CreateChangeLogDto } from '../changelog/types/changelog.types';
const formatted = new Date().toLocaleTimeString('en-US', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  fractionalSecondDigits: 3,
});

@Injectable()
export class TaskService {
  private logger = new Logger(TaskService.name);
  constructor(
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    private projectGateway: ProjectGateway,
  ) {}

  async getTaskHistory(taskId: number) {
    return this.cacheHelper.getOrSet(`task_history_${taskId}`, () =>
      this.prisma.changeLog.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: {
          task: true,
          member: { select: { id: true, user_id: true, username: true } },
        },
      }),
    );
  }

  async findAllByProject(projsID: number) {
    return this.cacheHelper.getOrSet(`tasks_project_${projsID}`, async () => {
      const projectTasks = await this.prisma.task.findMany({
        where: { projectId: projsID, deletedAt: null },
        include: {
          assignees: {
            include: {
              member: { select: { id: true, user_id: true, username: true } },
            },
          },
        },
      });
      if (!projectTasks)
        throw new NotFoundException('Task will be displayed here');
      return projectTasks;
    });
  }

  async deleteTask(taskId: number, callerId: number, callerUserId: string) {
    this.logger.debug(`deleteTask called`, { taskId, callerId, callerUserId });

    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    this.logger.debug(`deleteTask: existing task lookup`, {
      taskId,
      found: !!existing,
    });

    if (!existing || existing.deletedAt) {
      this.logger.debug(`deleteTask: task not found or already deleted`, {
        taskId,
      });
      throw new NotFoundException('Task not found');
    }

    let deleted;
    try {
      this.logger.debug(`deleteTask: starting transaction`, { taskId });

      deleted = await this.prisma.$transaction(async (tx) => {
        const task = await tx.task.update({
          where: { id: taskId },
          data: { deletedAt: new Date() },
        });
        this.logger.debug(`deleteTask: task soft-deleted`, {
          taskId: task.id,
          projectId: task.projectId,
          deletedAt: task.deletedAt,
        });

        const log = await tx.changeLog.create({
          data: {
            taskId: task.id,
            taskTitle: task.title,
            username: callerUserId,
            field: 'task deletion',
            oldValue: task.status,
            newValue: 'deleted',
          },
        });
        this.logger.debug(`deleteTask: changelog entry created`, {
          changeLogId: log.id,
          taskId: task.id,
        });

        return task;
      });

      this.logger.debug(`deleteTask: transaction committed`, {
        taskId: deleted.id,
      });
    } catch (err) {
      this.logger.debug(`deleteTask: transaction failed`, {
        taskId,
        errorCode:
          err instanceof Prisma.PrismaClientKnownRequestError
            ? err.code
            : undefined,
        errorMessage: err instanceof Error ? err.message : err,
      });

      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2025'
      ) {
        throw new NotFoundException('Task not found');
      }
      console.log(`Failed to delete task ${taskId}`, err);
      throw new InternalServerErrorException('Failed to delete task');
    }

    await this.cacheHelper.invalidate(
      'all_tasks',
      `tasks_project_${existing.projectId}`,
      `task_history_${taskId}`,
    );
    await this.cacheHelper.invalidatePattern(
      `changelog_project_${existing.projectId}_*`,
    );

    this.projectGateway.emitToProject(existing.projectId, 'task:deleted', {
      task: deleted,
    });

    this.logger.debug(`deleteTask: completed successfully`, { taskId });
    return deleted;
  }

  async update(updateDto: UpdateTaskDto, userId: string, callerId: number) {
    console.log(`[timing] update() started at ${formatted}`);

    if (!updateDto.task_id) {
      throw new BadRequestException('Task ID is required');
    }
    const taskId: number = Number(updateDto.task_id);

    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!existing || existing.deletedAt)
      throw new NotFoundException('Task not found');

    // Only actual members of this task's project can update it.
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: {
          projectId: existing.projectId,
          memberId: callerId,
        },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    // Anyone being assigned must also actually be a member of this project.
    if (updateDto.assigneeIds && updateDto.assigneeIds.length > 0) {
      const validCount = await this.prisma.projectMember.count({
        where: {
          projectId: existing.projectId,
          memberId: { in: updateDto.assigneeIds },
        },
      });
      if (validCount !== updateDto.assigneeIds.length) {
        throw new BadRequestException(
          'One or more assignees are not members of this project',
        );
      }
    }

    // Normalize status FIRST, before building the diff list
    let formattedStatus: TaskStatus | undefined;
    if (updateDto.status) {
      const normalized = updateDto.status.replace(/\s+/g, '_').toLowerCase();
      if (normalized === 'in_progress')
        formattedStatus = TaskStatus.In_Progress;
      else if (normalized === 'todo') formattedStatus = TaskStatus.Todo;
      else if (normalized === 'done') formattedStatus = TaskStatus.Done;
    }

    const fieldsToTrack = [
      { field: 'title', oldValue: existing.title, newValue: updateDto.title },
      {
        field: 'description',
        oldValue: existing.description,
        newValue: updateDto.description,
      },
      { field: 'status', oldValue: existing.status, newValue: formattedStatus }, // <-- use normalized enum
      {
        field: 'priority',
        oldValue: existing.priority,
        newValue: updateDto.priority,
      },
    ];

    // Snapshot the title as it was BEFORE this update, so renaming a task
    // later never rewrites what earlier log entries display.
    const taskTitleSnapshot = updateDto.title ?? existing.title;

    const logs = userId
      ? fieldsToTrack
          .filter(({ newValue }) => newValue !== undefined)
          .filter(
            ({ oldValue, newValue }) =>
              String(oldValue ?? '') !== String(newValue ?? ''),
          )
          .map(({ field, oldValue, newValue }) => ({
            taskId,
            taskTitle: taskTitleSnapshot,
            username: userId,
            field,
            oldValue: String(oldValue ?? ''),
            newValue: String(newValue ?? ''),
            // Remark only ever makes sense attached to a description
            // change — a status move or priority bump getting a stray
            // "Updated via UI modal" note was confusing and wrong.
            remark: field === 'description' ? (updateDto.remark ?? null) : null,
          }))
      : [];

    // Assignee changes get their own diff, logged separately, since they
    // don't fit the simple old/new string comparison the fields above use.
    if (userId && updateDto.assigneeIds !== undefined) {
      const existingAssignees = await this.prisma.taskAssignee.findMany({
        where: { taskId },
        select: { memberId: true },
      });
      const oldIds = existingAssignees.map((a) => a.memberId).sort();
      const newIds = [...updateDto.assigneeIds].sort();

      const changed =
        oldIds.length !== newIds.length ||
        oldIds.some((id, i) => id !== newIds[i]);

      if (changed) {
        logs.push({
          taskId,
          taskTitle: taskTitleSnapshot,
          username: userId,
          field: 'assignees',
          oldValue: oldIds.join(','),
          newValue: newIds.join(','),
          remark: null,
        });
      }
    }

    const updated = await this.prisma.$transaction(async (tx) => {
      if (updateDto.assigneeIds !== undefined) {
        await tx.taskAssignee.deleteMany({ where: { taskId } });
        if (updateDto.assigneeIds.length > 0) {
          await tx.taskAssignee.createMany({
            data: updateDto.assigneeIds.map((memberId) => ({
              taskId,
              memberId,
            })),
          });
        }
      }
      await tx.task.update({
        where: { id: taskId },
        data: {
          ...(updateDto.title && { title: updateDto.title }),
          ...(updateDto.description !== undefined && {
            description: updateDto.description,
          }),
          ...(formattedStatus && { status: formattedStatus }),
          ...(updateDto.priority && {
            priority: updateDto.priority,
          }),
        },
      });

      for (const log of logs) {
        await tx.changeLog.create({ data: log });
      }

      // Refetch with the now-current assignee list included.
      return tx.task.findUniqueOrThrow({
        where: { id: taskId },
        include: {
          assignees: {
            include: {
              member: { select: { id: true, user_id: true, username: true } },
            },
          },
        },
      });
    });

    await Promise.all([
      this.cacheHelper.invalidate(
        'all_tasks',
        `tasks_project_${updated.projectId}`,
        `task_history_${taskId}`,
      ),
      this.cacheHelper.invalidatePattern(
        `changelog_project_${updated.projectId}_*`,
      ),
    ]);

    console.log(formatted);
    // August 10, 2026
    // Broadcast to everyone else viewing this project's board so their
    // TanStack Query cache updates without waiting for a refetch.
    console.log(`[timing] about to emit at ${formatted}`);

    this.projectGateway.emitToProject(updated.projectId, 'task:updated', {
      task: updated,
      updatedBy: userId,
    });

    if (logs.length > 0) {
      this.projectGateway.emitToProject(updated.projectId, 'log:created', {
        projectId: updated.projectId,
        logs,
      });
    }

    return updated;
  }

  async findOne(id: number) {
    const onetask = await this.prisma.task.findFirst({
      where: { id, deletedAt: null },
    });
    if (!onetask) throw new NotFoundException('Task not found');
    return onetask;
  }

  async findAll() {
    return this.cacheHelper.getOrSet('all_tasks', async () => {
      const all = await this.prisma.task.findMany({
        where: { deletedAt: null },
      });
      if (all.length === 0) throw new NotFoundException('No tasks found');
      return all;
    });
  }

  async create(dto: CreateTaskDto, userId: string, callerId: number) {
    // Only actual members of this project can create tasks in it.
    const membership = await this.prisma.projectMember.findUnique({
      where: {
        projectId_memberId: { projectId: dto.project_id, memberId: callerId },
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    const STATUS_MAP: Record<string, TaskStatus> = {
      todo: TaskStatus.Todo,
      in_progress: TaskStatus.In_Progress,
      done: TaskStatus.Done,
    };
    const normalizedStatus = String(dto.status)
      .replace(/\s+/g, '_')
      .toLocaleLowerCase();
    const dbStatus = STATUS_MAP[normalizedStatus];

    // const dbStatus: typeof STATUS_MAP[String,];
    if (!dbStatus) {
      throw new BadRequestException('Invalid status value provided');
    }

    const PRIORITY_MAP: Record<string, Priority> = {
      Critical: Priority.Critical,
      High: Priority.High,
      Medium: Priority.Medium,
      Low: Priority.Low,
    };

    const dbPriority = PRIORITY_MAP[String(dto.priority)];
    // let dbPriority: Priority;

    // Anyone being assigned must also actually be a member of this project.
    if (dto.assigneeIds && dto.assigneeIds.length > 0) {
      const validCount = await this.prisma.projectMember.count({
        where: {
          projectId: dto.project_id,
          memberId: { in: dto.assigneeIds },
        },
      });
      if (validCount !== dto.assigneeIds.length) {
        throw new BadRequestException(
          'One or more assignees are not members of this project',
        );
      }
    }

    const newTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: dto.project_id,
          title: dto.title,
          description: dto.description,
          status: dbStatus,
          priority: dbPriority,
        },
      });

      if (dto.assigneeIds && dto.assigneeIds.length > 0) {
        await tx.taskAssignee.createMany({
          data: dto.assigneeIds.map((memberId) => ({
            taskId: task.id,
            memberId,
          })),
        });
      }

      await tx.changeLog.create({
        data: {
          taskId: task.id,
          taskTitle: task.title,
          username: userId,
          field: 'task creation',
          oldValue: '',
          newValue: task.title,
          remark: dto.remark ?? null,
        },
      });

      // Refetch with assignees included so the response/broadcast has
      // the full member data, not just raw IDs.
      return tx.task.findUniqueOrThrow({
        where: { id: task.id },
        include: {
          assignees: {
            include: {
              member: { select: { id: true, user_id: true, username: true } },
            },
          },
        },
      });
    });

    await this.cacheHelper.invalidate(
      'all_tasks',
      `tasks_project_${newTask.projectId}`,
    );

    await this.cacheHelper.invalidatePattern(
      `changelog_project_${newTask.projectId}_*`,
    );

    this.projectGateway.emitToProject(newTask.projectId, 'task:created', {
      task: newTask,
      createdBy: userId,
    });
    this.projectGateway.emitToProject(newTask.projectId, 'log:created', {
      projectId: newTask.projectId,
    });

    return newTask;
  }
}
