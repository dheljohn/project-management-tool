import { Module } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../database/src/Entities/member.entity';
import { Project } from '../../database/src/Entities/project.entity';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';
import { Task } from '../../database/src/Entities/task.entity';
import { TaskAssignee } from '../../database/src/Entities/task-assignee.entity';
import { RefreshToken } from '../../database/src/Entities/refresh-token.entity';
import { InviteCode } from '../../database/src/Entities/invite-code.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Project,
      ProjectMember,
      ChangeLog,
      Task,
      TaskAssignee,
      RefreshToken,
      InviteCode,
    ]),
  ],
  controllers: [SeedController],
  providers: [SeedService],
})
export class SeedModule {}
