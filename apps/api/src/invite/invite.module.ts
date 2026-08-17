import { Module } from '@nestjs/common';
import { InvitesService } from './invite.service';
import { InvitesController } from './invite.controller';
import { ProjectGatewayModule } from '../gateway/project-gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';
import { InviteCode } from '../../database/src/Entities/invite-code.entity';
import { Project } from '../../database/src/Entities/project.entity';

@Module({
  imports: [
    ProjectGatewayModule,
    TypeOrmModule.forFeature([ProjectMember, InviteCode, Project]),
  ],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InviteModule {}
