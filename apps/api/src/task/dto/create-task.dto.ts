// src/tasks/dto/create-task.dto.ts
import { IsEnum, IsNotEmpty, IsNumber, IsString } from 'class-validator';
import { TaskStatusPayload } from '../enums/status.enum';

export class CreateTaskDto {
  @IsNumber()
  @IsNotEmpty()
  project_id: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsNotEmpty()
  status: TaskStatusPayload;

  @IsString()
  @IsNotEmpty()
  contents: string;
}
