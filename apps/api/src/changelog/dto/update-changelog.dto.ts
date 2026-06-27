// update-changelog.dto.ts
import { IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class UpdateChangelogDto {
  @IsInt()
  @IsNotEmpty()
  id!: number;

  @IsString()
  @IsOptional()
  remark?: string;
}
