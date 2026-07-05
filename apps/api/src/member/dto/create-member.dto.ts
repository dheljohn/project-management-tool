import { IsEmail, IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  user_id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  role?: string;
}
