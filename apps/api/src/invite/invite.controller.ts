import {
  Controller,
  Post,
  Get,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { InvitesService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { JoinProjectDto } from './dto/join-project.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { ApiTags, ApiCookieAuth } from '@nestjs/swagger';

type AuthenticatedRequest = { user: { id: number } };

@ApiTags('invites')
@ApiCookieAuth('auth_token')
@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  create(@Req() req: AuthenticatedRequest, @Body() dto: CreateInviteDto) {
    return this.invitesService.create(req.user.id, dto);
  }

  @Get('project/:projectId')
  listForProject(
    @Req() req: AuthenticatedRequest,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.invitesService.listForProject(req.user.id, projectId);
  }

  @Delete(':id')
  revoke(
    @Req() req: AuthenticatedRequest,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.invitesService.revoke(req.user.id, id);
  }

  @Post('join')
  join(@Req() req: AuthenticatedRequest, @Body() dto: JoinProjectDto) {
    return this.invitesService.join(req.user.id, dto);
  }
}
