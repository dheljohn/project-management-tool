// src/tasks/dto/create-task.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatusPayload } from '../enums/status.enum';
import { TaskPriorityPayload } from '../enums/priority.enum';

export class CreateTaskDto {
  @IsNumber()
  @IsNotEmpty()
  project_id!: number;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsNotEmpty()
  status!: TaskStatusPayload;

  @IsEnum(TaskPriorityPayload, {
    message: 'priority must be exactly: Critical, High, Medium, or Low',
  })
  @IsNotEmpty()
  priority!: TaskPriorityPayload;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
