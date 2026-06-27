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
      { field: 'title', oldValue: existing.title, newValue: updateDto.name },
      {
        field: 'description',
        oldValue: existing.description,
        newValue: updateDto.contents,
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
          ...(updateDto.name && { title: updateDto.name }),
          ...(updateDto.contents !== undefined && {
            description: updateDto.contents,
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

    // 1. Save the transaction results into a variable
    const newTask = await this.prisma.$transaction(async (tx) => {
      const task = await tx.task.create({
        data: {
          projectId: dto.project_id,
          // user_id: dto.user_id,
          title: dto.name, // Prisma saves it as 'title'
          description: dto.contents,
          status: dbStatus,
        },
      });

      const newLog = await tx.changeLog.create({
        data: {
          taskId: task.id,
          username: dto.user_id,
          field: 'task creation',
          oldValue: '',
          newValue: 'Task Created',
          remark: dto.remark ?? 'Initial creation log',
        },
      });
      console.log('TASK PAYLOAD', task);
      return task; // Returns the database row object
    });

    // 2. Destructure 'title' out, and rename it to 'name' for the frontend response
    const { title, ...restOfTask } = newTask;

    return {
      ...restOfTask,
      name: title, // This guarantees the frontend gets 'name' back!
    };
  }
}
