import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ProjectGatewayModule } from '../gateway/project-gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Task } from '../../database/src/Entities/task.entity';
import { TaskAssignee } from '../../database/src/Entities/task-assignee.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, TaskAssignee, ProjectMember, ChangeLog]),
    ProjectGatewayModule,
  ],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
