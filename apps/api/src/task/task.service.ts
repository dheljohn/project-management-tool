import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from '../../database/enums/task-status.enum';
import { Priority } from '../../database/enums/priority.enum';
// import { PrismaService } from '../prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheHelper } from '../common/cache/cache.helper';
import { ProjectGateway } from '../gateway/project.gateway';
// import { Prisma } from '../../generated/prisma/client';
import { DataSource, EntityManager, In, IsNull, Repository } from 'typeorm';
import { Task } from '../../database/src/Entities/task.entity';
import { TaskAssignee } from '../../database/src/Entities/task-assignee.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';
// import { toDotPath } from 'zod/v4/core';
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
    // private prisma: PrismaService,
    private cacheHelper: CacheHelper,
    private projectGateway: ProjectGateway,
    @InjectRepository(Task)
    private readonly taskRepo: Repository<Task>,
    @InjectRepository(TaskAssignee)
    private readonly taskAssigneeRepo: Repository<TaskAssignee>,
    @InjectRepository(ProjectMember)
    private readonly projectMemberRepo: Repository<ProjectMember>,
    @InjectRepository(ChangeLog)
    private readonly changeLogRepo: Repository<ChangeLog>,
    private readonly dataSource: DataSource,
  ) {}

  private findTaskWithAssignees(manager: EntityManager, taskId: number) {
    return manager.findOneOrFail(Task, {
      where: {
        id: taskId,
      },
      relations: {
        assignees: {
          member: true,
        },
      },
    });
  }

  async create(dto: CreateTaskDto, userId: string, callerId: number) {
    const membership = await this.projectMemberRepo.findOne({
      where: {
        projectId: dto.project_id,
        memberId: callerId,
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
      const validCount = await this.projectMemberRepo.count({
        where: {
          projectId: dto.project_id,
          memberId: In(dto.assigneeIds),
        },
      });
      if (validCount !== dto.assigneeIds.length) {
        throw new BadRequestException(
          'One or more assignees are not members of this project',
        );
      }
    }

    const newTask = await this.dataSource.transaction(async (manager) => {
      const task = manager.create(Task, {
        projectId: dto.project_id,
        title: dto.title,
        description: dto.description,
        status: dbStatus,
        priority: dbPriority,
      });

      await manager.save(Task, task);

      if (dto.assigneeIds?.length) {
        await manager.insert(
          TaskAssignee,
          dto.assigneeIds.map((memberId) => ({
            taskId: task.id,
            memberId,
          })),
        );
      }

      await manager.insert(ChangeLog, {
        taskId: task.id,
        taskTitle: task.title,
        username: userId,
        field: 'task creation',
        oldValue: '',
        newValue: task.title,
        remark: dto.remark ?? null,
      });

      return this.findTaskWithAssignees(manager, task.id);
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

  async getTaskHistory(taskId: number) {
    return this.cacheHelper.getOrSet(`task_history_${taskId}`, () =>
      this.changeLogRepo.find({
        where: { taskId },
        order: { createdAt: 'desc' },
        relations: {
          task: true,
          member: true,
        },
        select: {
          id: true,
          taskId: true,
          taskTitle: true,
          username: true,
          field: true,
          oldValue: true,
          newValue: true,
          remark: true,
          createdAt: true,
          member: {
            id: true,
            user_id: true,
            username: true,
          },
        },
      }),
    );
  }

  async findAllByProject(projsID: number) {
    return this.cacheHelper.getOrSet(`tasks_project_${projsID}`, async () => {
      const projectTasks = await this.taskRepo.find({
        where: { projectId: projsID, deletedAt: IsNull() },
        relations: {
          assignees: {
            member: true,
          },
        },
      });
      if (!projectTasks.length)
        throw new NotFoundException('Task will be displayed here');
      return projectTasks;
    });
  }

  async deleteTask(taskId: number, callerId: number, callerUserId: string) {
    this.logger.debug('deleteTask called', {
      taskId,
      callerId,
      callerUserId,
    });

    if (!taskId) {
      throw new BadRequestException('Task ID is required');
    }

    const existing = await this.taskRepo.findOne({
      where: {
        id: taskId,
        deletedAt: IsNull(),
      },
    });

    this.logger.debug('deleteTask: existing task lookup', {
      taskId,
      found: !!existing,
    });

    if (!existing) {
      this.logger.debug('deleteTask: task not found or already deleted', {
        taskId,
      });

      throw new NotFoundException('Task not found');
    }

    const deleted = await this.dataSource.transaction(async (manager) => {
      const result = await manager.update(
        Task,
        {
          id: taskId,
          deletedAt: IsNull(),
        },
        {
          deletedAt: new Date(),
        },
      );

      if (result.affected === 0) {
        throw new NotFoundException('Task not found');
      }

      const task = await manager.findOneOrFail(Task, {
        where: { id: taskId },
        withDeleted: true,
      });

      this.logger.debug('deleteTask: task soft-deleted', {
        taskId: task.id,
        projectId: task.projectId,
        deletedAt: task.deletedAt,
      });

      const log = await manager.insert(ChangeLog, {
        taskId: task.id,
        taskTitle: task.title,
        username: callerUserId,
        field: 'task deletion',
        oldValue: task.status,
        newValue: 'deleted',
      });

      this.logger.debug('deleteTask: changelog entry created', {
        taskId: task.id,
        changeLogId: log.identifiers[0]?.id,
      });

      return task;
    });

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

    this.logger.debug('deleteTask: completed successfully', {
      taskId,
    });

    return deleted;
  }

  async update(updateDto: UpdateTaskDto, userId: string, callerId: number) {
    console.log(`[timing] update() started at ${formatted}`);

    if (!updateDto.task_id) {
      throw new BadRequestException('Task ID is required');
    }
    const taskId: number = Number(updateDto.task_id);

    const existing = await this.taskRepo.findOne({
      where: { id: taskId },
    });
    if (!existing || existing.deletedAt)
      throw new NotFoundException('Task not found');

    // Only actual members of this task's project can update it.
    const membership = await this.projectMemberRepo.find({
      where: {
        projectId: existing.projectId,
        memberId: callerId,
      },
    });
    if (!membership) {
      throw new ForbiddenException('Not a member of this project');
    }

    if (updateDto.assigneeIds && updateDto.assigneeIds.length > 0) {
      const validCount = await this.projectMemberRepo.count({
        where: {
          projectId: existing.projectId,
          memberId: In(updateDto.assigneeIds),
        },
      });
      if (validCount !== updateDto.assigneeIds.length) {
        throw new BadRequestException(
          'One or more assignees are not members of this project',
        );
      }
    }
    let formattedStatus: TaskStatus | undefined;
    if (updateDto.status) {
      const normalized = updateDto.status.replace(/\s+/g, '_').toLowerCase();
      if (normalized === 'in_progress')
        formattedStatus = TaskStatus.In_Progress;
      else if (normalized === 'todo') formattedStatus = TaskStatus.Todo;
      else if (normalized === 'done') formattedStatus = TaskStatus.Done;
    }
    const formattedPriority =
      updateDto.priority !== undefined
        ? Priority[updateDto.priority]
        : undefined;

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

    if (userId && updateDto.assigneeIds !== undefined) {
      const existingAssignees = await this.taskAssigneeRepo.find({
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

    //unfinished

    const updated = await this.dataSource.transaction(async (manager) => {
      if (updateDto.assigneeIds !== undefined) {
        await manager.delete(TaskAssignee, { taskId });
        if (updateDto.assigneeIds.length > 0) {
          await manager.insert(
            TaskAssignee,
            updateDto.assigneeIds.map((memberId) => ({
              taskId,
              memberId,
            })),
          );
        }
      }

      const updateData: Partial<Task> = {
        ...(updateDto.title !== undefined && {
          title: updateDto.title,
        }),

        ...(updateDto.description !== undefined && {
          description: updateDto.description,
        }),

        ...(formattedStatus !== undefined && {
          status: formattedStatus,
        }),

        ...(updateDto.priority !== undefined && {
          priority: formattedPriority,
        }),
      };

      await manager.update(Task, { id: taskId }, updateData);

      for (const log of logs) {
        await manager.insert(ChangeLog, log);
      }

      // Refetch with the now-current assignee list included.
      return manager.findOneOrFail(Task, {
        where: { id: taskId },
        relations: {
          assignees: {
            member: true,
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
    const singleTask = await this.taskRepo.findOne({
      where: { id, deletedAt: IsNull() },
    });
    if (!singleTask) throw new NotFoundException('Task not found');
    return singleTask;
  }

  async findAll() {
    return this.cacheHelper.getOrSet('all_tasks', async () => {
      const all = await this.taskRepo.find({
        where: { deletedAt: IsNull() },
      });
      if (all.length === 0) throw new NotFoundException('No tasks found');
      return all;
    });
  }
}
