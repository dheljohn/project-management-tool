import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import type { RequestWithUser } from '../common/interface/request-with-user.interface';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UpdateProjectDto } from './dto/update-project.dto';
import { ApiHeader, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('projects')
@Controller('test02')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create_project')
  create(@Body() createDto: CreateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.create(req.user.id, createDto);
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_all_projects')
  findAll() {
    return this.projectsService.findAll();
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_user_projects')
  findAllByUser(@Req() req: RequestWithUser) {
    return this.projectsService.findAllByUser(req.user.id);
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_project')
  findOne(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('patch_project')
  update(@Body() updateDto: UpdateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.update(req.user.id, updateDto);
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_project_members')
  listMembers(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Req() req: RequestWithUser,
  ) {
    return this.projectsService.listMembers(req.user.id, projectId);
  }
}
