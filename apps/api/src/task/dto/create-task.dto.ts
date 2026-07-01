// src/tasks/dto/create-task.dto.ts
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { TaskStatusPayload } from '../enums/status.enum';

export class CreateTaskDto {
  @IsNumber()
  @IsNotEmpty()
  project_id!: number;

  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsNotEmpty()
  status!: TaskStatusPayload;

  @IsString()
  @IsOptional()
  description!: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
