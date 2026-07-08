import { IsEmail, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';

export class UpdateMemberDto {
  @IsNotEmpty()
  @IsString()
  user_id!: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsNotEmpty()
  @IsString()
  old_password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  new_password!: string;
}
