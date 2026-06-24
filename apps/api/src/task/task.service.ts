import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { TaskStatus } from 'generated/prisma/enums';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
  constructor(private prisma: PrismaService) {}
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
