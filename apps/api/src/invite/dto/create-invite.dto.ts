import { IsInt, IsOptional, Min, Max } from 'class-validator';

export class CreateInviteDto {
  @IsInt()
  projectId: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(1000)
  maxUses?: number; // defaults to 10 in service

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(30)
  expiresInDays?: number; // defaults to 7 in service
}
