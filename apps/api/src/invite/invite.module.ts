import { Module } from '@nestjs/common';
import { InvitesService } from './invite.service';
import { InvitesController } from './invite.controller';

@Module({
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InviteModule {}
