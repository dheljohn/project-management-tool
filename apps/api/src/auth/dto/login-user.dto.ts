import { IsNotEmpty, IsString } from 'class-validator';
export class LoginUserDto {
  //assign types and validate
  @IsString()
  user_id!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}
