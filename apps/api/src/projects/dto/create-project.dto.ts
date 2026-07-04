import { Type, Transform } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name!: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @Type(() => Number)
  @Transform(({ value }) => Number(value))
  @IsInt()
  @Min(0, { message: 'WIP limit cannot be negative' })
  @Max(100, { message: 'WIP limit cannot be greater than 100' })
  @IsOptional()
  wipLimit?: number;
}
