// create-changelog.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateChangelogDto {
  @IsInt()
  @IsNotEmpty()
  task_id!: number;

  @IsString()
  @IsNotEmpty()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  old_status!: string;

  @IsString()
  @IsNotEmpty()
  new_status!: string;

  @IsString()
  @IsOptional()
  remark?: string;
}
