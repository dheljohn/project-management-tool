import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
  async getTaskHistory(taskId: number) {
    return this.prisma.changeLog.findMany({
      where: { taskId },
      orderBy: { createdAt: 'desc' },
      include: {
        task: true,
        member: true,
      },
    });
  }
  async findAllByProject(projsID: number) {
    const projectTasks = await this.prisma.task.findMany({
      where: { projectId: projsID },
    });
    if (!projectTasks)
      throw new NotFoundException('Task will be displayed here');
    return projectTasks;
  }

  async update(updateDto: UpdateTaskDto) {
    if (!updateDto.task_id) {
      throw new BadRequestException('Task ID is required');
    }
    const taskId: number = Number(updateDto.task_id);

    const existing = await this.prisma.task.findUnique({
      where: { id: taskId },
    });
    if (!existing) throw new NotFoundException('Task not found');

    const fieldsToTrack = [
      { field: 'title', oldValue: existing.title, newValue: updateDto.title },
      {
        field: 'description',
        oldValue: existing.description,
        newValue: updateDto.description,
      },
      {
        field: 'status',
        oldValue: existing.status,
        newValue: updateDto.status,
      },
    ];

    const logs = updateDto.user_id
      ? fieldsToTrack
          .filter(({ newValue }) => newValue !== undefined)
          .filter(
            ({ oldValue, newValue }) =>
              String(oldValue ?? '') !== String(newValue ?? ''),
          )
          .map(({ field, oldValue, newValue }) => ({
            taskId,
            username: updateDto.user_id!,
            field,
            oldValue: String(oldValue ?? ''),
            newValue: String(newValue ?? ''),
            remark: updateDto.remark ?? null,
          }))
      : [];

    let formattedStatus: TaskStatus | undefined;
    if (updateDto.status) {
      const normalized = updateDto.status.replace(/\s+/g, '_').toLowerCase();
      if (normalized === 'in_progress')
        formattedStatus = TaskStatus.In_Progress;
      else if (normalized === 'todo') formattedStatus = TaskStatus.Todo;
      else if (normalized === 'done') formattedStatus = TaskStatus.Done;
    }

    const [updated] = await this.prisma.$transaction([
      this.prisma.task.update({
        where: { id: taskId },
        data: {
          ...(updateDto.title && { title: updateDto.title }),
          ...(updateDto.description !== undefined && {
            description: updateDto.description,
          }),
          ...(formattedStatus && { status: formattedStatus }),
        },
      }),
      ...logs.map((log) => this.prisma.changeLog.create({ data: log })),
    ]);

    return updated;
  }

  async findOne(id: number) {
    const onetask = await this.prisma.task.findUnique({ where: { id } });
    if (!onetask) throw new NotFoundException('Task not found');
    return onetask;
  }
  async findAll() {
    const all = await this.prisma.task.findMany();
    if (all.length === 0) throw new NotFoundException('No tasks found');
    return all;
  }

  async create(dto: CreateTaskDto) {
    let dbStatus: TaskStatus;

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

    // Save the transaction results into a variable
    const newTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: dto.project_id,
          title: dto.title,
          description: dto.description,
          status: dbStatus,
        },
      });

      const newLog = await tx.changeLog.create({
        data: {
          taskId: task.id,
          username: dto.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: task.title,
          remark: dto.remark ?? 'Initial creation log',
        },
      });
      console.log('TASK PAYLOAD', newLog);
      return task;
    });

    return newTask;
  }
}
