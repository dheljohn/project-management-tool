import { Module } from '@nestjs/common';
import { InvitesService } from './invite.service';
import { InvitesController } from './invite.controller';
import { ProjectGatewayModule } from '../gateway/project-gateway.module';

@Module({
  imports: [ProjectGatewayModule],
  controllers: [InvitesController],
  providers: [InvitesService],
})
export class InviteModule {}
