import {
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateProjectDto {
  @Type(() => Number)
  @IsInt()
  id: number;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @Type(() => Number)
  @IsInt()
  @Min(0, { message: 'WIP limit cannot be negative' })
  @Max(100, { message: 'WIP limit cannot be greater than 100' })
  @IsOptional()
  wipLimit?: number;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;
}
