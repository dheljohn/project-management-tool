import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
// import type { RequestWithUser } from 'src/common/interface/request-with-user.interface';

@Controller('test03')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create_task')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateTaskDto) {
    return this.taskService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_all_tasks')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.taskService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_task')
  @HttpCode(HttpStatus.OK)
  findOne(@Query('id') id: string) {
    return this.taskService.findOne(Number(id));
  }

  @Get('get_all_tasks_by_project')
  @HttpCode(HttpStatus.OK)
  findAllByProject(@Query('projectId') projectId: string) {
    return this.taskService.findAllByProject(Number(projectId));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('patch_task')
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateTaskDto) {
    return this.taskService.update(updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_task_history')
  @HttpCode(HttpStatus.OK)
  getHistory(@Query('task_id') taskId: string) {
    return this.taskService.getTaskHistory(Number(taskId));
  }
}
