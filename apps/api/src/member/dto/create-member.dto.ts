import { IsEmail, IsString, IsNotEmpty } from 'class-validator';

export class CreateMemberDto {
  @IsNotEmpty()
  user_id!: string;

  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
