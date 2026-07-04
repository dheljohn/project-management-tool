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
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard'; // adjust path to your actual guard

@UseGuards(JwtAuthGuard)
@Controller('invites')
export class InvitesController {
  constructor(private invitesService: InvitesService) {}

  @Post()
  create(@Req() req, @Body() dto: CreateInviteDto) {
    return this.invitesService.create(req.user.id, dto);
  }

  @Get('project/:projectId')
  listForProject(
    @Req() req,
    @Param('projectId', ParseIntPipe) projectId: number,
  ) {
    return this.invitesService.listForProject(req.user.id, projectId);
  }

  @Delete(':id')
  revoke(@Req() req, @Param('id', ParseIntPipe) id: number) {
    return this.invitesService.revoke(req.user.id, id);
  }

  @Post('join')
  join(@Req() req, @Body() dto: JoinProjectDto) {
    return this.invitesService.join(req.user.id, dto);
  }
}
