import { IsString, Length } from 'class-validator';

export class JoinProjectDto {
  @IsString()
  @Length(6, 12)
  code: string;
}
