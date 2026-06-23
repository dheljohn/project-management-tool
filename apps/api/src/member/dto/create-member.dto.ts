import { IsEmail, IsString, IsOptional } from 'class-validator';

export class CreateMemberDto {
  @IsString()
  user_id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
