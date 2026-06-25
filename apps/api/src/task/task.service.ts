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
  async findAllByProject(arg0: number) {
    const projectTasks = await this.prisma.task.findMany({
      where: { projectId: arg0 },
    });
    if (!projectTasks)
      throw new NotFoundException('Task will be displayed here');
    return projectTasks;
  }
  constructor(private prisma: PrismaService) {}

  async update(updateDto: UpdateTaskDto) {
    const { project_id, ...data } = updateDto;
    console.log(data);
    const task = await this.prisma.task.findUnique({
      where: {
        id: updateDto.project_id,
        projectId: updateDto.project_id,
      },
    });

    if (!task) {
      throw new NotFoundException('Project not found or not yours');
    }

    return this.prisma.task.update({
      where: { id: updateDto.project_id },
      data: {
        projectId: updateDto.project_id,
        title: updateDto.name,
        status: updateDto.status as TaskStatus,
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
