import { Module } from '@nestjs/common';
import { ChangelogService } from './changelog.service';
import { ChangelogController } from './changelog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';
import { Task } from '../../database/src/Entities/task.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog, Task, ProjectMember])],
  controllers: [ChangelogController],
  providers: [ChangelogService],
  exports: [ChangelogService],
})
export class ChangelogModule {}
