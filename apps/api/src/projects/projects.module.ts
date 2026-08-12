import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { ProjectGatewayModule } from '../gateway/project-gateway.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Project } from '../../database/src/Entities/project.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';

@Module({
  imports: [
    ProjectGatewayModule,
    TypeOrmModule.forFeature([Project, ProjectMember]),
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
})
export class ProjectsModule {}
