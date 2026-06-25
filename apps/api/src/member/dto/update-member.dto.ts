import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class UpdateMemberDto {
  @IsNotEmpty()
  @IsString()
  user_id!: string; // Keeps the ID string from your JSON payload

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsNotEmpty()
  @IsString()
  old_password!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(6) // Enforces a minimum password length
  new_password!: string;
}
