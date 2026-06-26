import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';
import { UpdateProjectDto } from 'src/projects/dto/update-project.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}

  async findAllByProject(projsID: number) {
    const projectTasks = await this.prisma.task.findMany({
      where: { projectId: projsID },
    });
    if (!projectTasks)
      throw new NotFoundException('Task will be displayed here');
    return projectTasks;
  }

  async updateStatus(updateDto: UpdateTaskDto) {
    let formattedStatus: TaskStatus;

    if (updateDto.status === 'In Progress') {
      formattedStatus = 'In_Progress' as TaskStatus;
    } else {
      formattedStatus = updateDto.status as unknown as TaskStatus;
    }

    // 2. Commit transaction to your PostgreSQL instance
    const update = await this.prisma.task.update({
      where: {
        id: updateDto.project_id,
      },
      data: {
        status: formattedStatus,
      },
    });

    console.log('🎉 Database successfully updated:', update);
    return update;
  }

  async update(updateDto: UpdateTaskDto) {
    // Extract fields and handle the status formatting
    const { project_id, status, ...data } = updateDto;

    let formattedStatus: TaskStatus | undefined;

    if (status) {
      // Converts "In Progress" or "in_progress" into "In_Progress"
      const normalized = status.replace(/\s+/g, '_').toLowerCase();

      if (normalized === 'in_progress')
        formattedStatus = TaskStatus.In_Progress;
      else if (normalized === 'todo') formattedStatus = TaskStatus.Todo;
      else if (normalized === 'done') formattedStatus = TaskStatus.Done;
    }

    return this.prisma.task.update({
      where: { id: updateDto.project_id }, // Ensure this is the Task ID
      data: {
        status: formattedStatus,
        title: updateDto.name,
        description: updateDto.contents,
      },
    });
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
    // Convert the payload spaces into your Prisma underscores
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

    // Insert directly into the Postgres Database
    return this.prisma.task.create({
      data: {
        projectId: dto.project_id,
        title: dto.name,
        description: dto.contents,
        status: dbStatus,
      },
    });
  }
}
