import { Module } from '@nestjs/common';
import { ChangelogService } from './changelog.service';
import { ChangelogController } from './changelog.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChangeLog } from '../../database/src/Entities/change-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ChangeLog])],
  controllers: [ChangelogController],
  providers: [ChangelogService],
  exports: [ChangelogService],
})
export class ChangelogModule {}
