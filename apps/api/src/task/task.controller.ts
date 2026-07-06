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
import type { Request, Response } from 'express';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateTaskDto } from './dto/update-task.dto';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { ApiHeader } from '@nestjs/swagger';

@Controller('test03')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create_task')
  create(
    @Body() dto: CreateTaskDto,
    @CurrentUser() user: { id: number; user_id: string },
  ) {
    return this.taskService.create(dto, user.user_id, user.id);
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

  @UseGuards(JwtAuthGuard)
  @Get('get_all_tasks_by_project')
  @HttpCode(HttpStatus.OK)
  findAllByProject(@Query('projectId') projectId: string) {
    return this.taskService.findAllByProject(Number(projectId));
  }

  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('patch_task')
  @HttpCode(HttpStatus.OK)
  update(
    @Body() dto: UpdateTaskDto,
    @CurrentUser() user: { id: number; user_id: string },
  ) {
    return this.taskService.update(dto, user.user_id, user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_task_history')
  @HttpCode(HttpStatus.OK)
  getHistory(@Query('task_id') taskId: string) {
    return this.taskService.getTaskHistory(Number(taskId));
  }
}
