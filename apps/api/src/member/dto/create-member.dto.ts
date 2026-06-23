import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateMemberDto {
  @IsString()
  @IsNotEmpty({ message: 'user_id is required' })
  user_id!: string;

  @IsEmail()
  @IsNotEmpty({ message: 'email is required' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'password is required' })
  @MinLength(8)
  @MaxLength(20)
  password!: string;
}
