import { Body, Controller, Post } from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';

@Controller('test03')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create_task')
  create(@Body() createDto: CreateTaskDto) {
    return this.taskService.create(createDto);
  }
}
