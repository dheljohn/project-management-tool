import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
  IsInt,
  IsArray,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatusPayload } from '../enums/status.enum';
import { Transform } from 'class-transformer';
import { TaskPriorityPayload } from '../enums/priority.enum';
export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  project_id?: number;

  @Transform(({ value }) => Number(value))
  @IsNumber()
  @IsOptional()
  task_id?: number;

  @IsString()
  @IsOptional()
  title?: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsOptional()
  status?: TaskStatusPayload;

  @IsEnum(TaskPriorityPayload, {
    message: 'priority must be exactly: Critical, High, Medium, or Low',
  })
  @IsOptional()
  priority?: TaskPriorityPayload;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  remark?: string;

  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  assigneeIds?: number[];
}
