import { Module } from '@nestjs/common';
import { TaskService } from './task.service';
import { TaskController } from './task.controller';
import { ProjectGatewayModule } from 'src/gateway/project-gateway.module';

@Module({
  imports: [ProjectGatewayModule],
  controllers: [TaskController],
  providers: [TaskService],
})
export class TaskModule {}
