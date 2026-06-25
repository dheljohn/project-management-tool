import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  IsOptional,
} from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';
import { CreateTaskDto } from './create-task.dto';
import { TaskStatusPayload } from '../enums/status.enum';

export class UpdateTaskDto extends PartialType(CreateTaskDto) {
  @IsNumber()
  @IsNotEmpty()
  @IsOptional()
  project_id?: number;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  name?: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsNotEmpty()
  @IsOptional()
  status?: TaskStatusPayload;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  contents?: string;
}
