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
import { Transform } from 'class-transformer';
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
  name?: string;

  @IsEnum(TaskStatusPayload, {
    message: 'status must be exactly: Todo, In Progress, or Done',
  })
  @IsOptional()
  status?: TaskStatusPayload;

  @IsString()
  @IsOptional()
  contents?: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
