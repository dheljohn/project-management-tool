// import { IsOptional, IsString } from 'class-validator';

// export class DeleteTaskDto {
//   @IsOptional()
//   @IsString()
//   reason?: string; // optional — why the task was deleted, if you want to capture it
// }

// delete-task.dto.ts
import { Type } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class DeleteTaskDto {
  @Type(() => Number)
  @IsInt({ message: 'task_id must be an integer' })
  @Min(1, { message: 'task_id must be a positive integer' })
  task_id: number;
}
