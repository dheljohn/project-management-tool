import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { Priority, TaskStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CacheHelper } from 'src/common/cache/cache.helper';

@Injectable()
export class TaskService {
  constructor(
    private prisma: PrismaService,
    private cacheHelper: CacheHelper,
  ) {}

  async getTaskHistory(taskId: number) {
    return this.cacheHelper.getOrSet(`task_history_${taskId}`, () =>
      this.prisma.changeLog.findMany({
        where: { taskId },
        orderBy: { createdAt: 'desc' },
        include: { task: true, member: true },
      }),
    );
  }

  async findAllByProject(projsID: number) {
    return this.cacheHelper.getOrSet(`tasks_project_${projsID}`, async () => {
      const projectTasks = await this.prisma.task.findMany({
        where: { projectId: projsID },
      });
      if (!projectTasks)
        throw new NotFoundException('Task will be displayed here');
      return projectTasks;
    });
  }

  async update(updateDto: UpdateTaskDto, userId: string) {
    if (!updateDto.task_id) {
      throw new BadRequestException('Task ID is required');
    }
    const taskId: number = Number(updateDto.task_id);

    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!existing) throw new NotFoundException('Task not found');

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

    const logs = userId
      ? fieldsToTrack
          .filter(({ newValue }) => newValue !== undefined)
          .filter(
            ({ oldValue, newValue }) =>
              String(oldValue ?? '') !== String(newValue ?? ''),
          )
          .map(({ field, oldValue, newValue }) => ({
            taskId,
            username: userId,
            field,
            oldValue: String(oldValue ?? ''),
            newValue: String(newValue ?? ''),
            remark: updateDto.remark ?? null,
          }))
      : [];

    const [updated] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          ...(updateDto.title && { title: updateDto.title }),
          ...(updateDto.description !== undefined && {
            description: updateDto.description,
          }),
          ...(formattedStatus && { status: formattedStatus }),
          ...(updateDto.priority && {
            priority: updateDto.priority as Priority,
          }),
        },
      }),
      ...logs.map((log) => this.prisma.changeLog.create({ data: log })),
    ]);

    await this.cacheHelper.invalidate(
      'all_tasks',
      `tasks_project_${updated.projectId}`,
      `task_history_${taskId}`,
      // `changelog_project_${updated.projectId}_start_all`,
    );
    await this.cacheHelper.invalidatePattern(
      `changelog_project_${updated.projectId}_*`,
    );

    return updated;
  }

  async findOne(id: number) {
    const onetask = await this.prisma.task.findUnique({ where: { id } });
    if (!onetask) throw new NotFoundException('Task not found');
    return onetask;
  }

  async findAll() {
    return this.cacheHelper.getOrSet('all_tasks', async () => {
      const all = await this.prisma.task.findMany();
      if (all.length === 0) throw new NotFoundException('No tasks found');
      return all;
    });
  }

  async create(dto: CreateTaskDto, userId: string) {
    let dbStatus: TaskStatus;
    let dbPriority: Priority;

    switch (dto.status) {
      case 'Todo':
        dbStatus = TaskStatus.Todo;
        break;
      case 'In Progress':
        dbStatus = TaskStatus.In_Progress;
        break;
      case 'Done':
        dbStatus = TaskStatus.Done;
        break;
      default:
        throw new BadRequestException('Invalid status value provided');
    }

    switch (dto.priority) {
      case 'Critical':
        dbPriority = Priority.Critical;
        break;
      case 'High':
        dbPriority = Priority.High;
        break;
      case 'Medium':
        dbPriority = Priority.Medium;
        break;
      case 'Low':
        dbPriority = Priority.Low;
        break;
      default:
        throw new BadRequestException('Invalid priority value provided');
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

      const newLog = await tx.changeLog.create({
        data: {
          taskId: task.id,
          username: userId,
          field: 'task creation',
          oldValue: '',
          newValue: task.title,
          remark: dto.remark ?? 'Initial creation log',
        },
      });
      console.log('TASK PAYLOAD', newLog);
      return task;
    });

    await this.cacheHelper.invalidate(
      'all_tasks',
      `tasks_project_${newTask.projectId}`,
    );
    await this.cacheHelper.invalidatePattern(
      `changelog_project_${newTask.projectId}_*`,
    );

    return newTask;
  }
}
