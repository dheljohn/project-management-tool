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
import type { RequestWithUser } from 'src/common/interface/request-with-user.interface';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { UpdateProjectDto } from './dto/update-project.dto';

@Controller('test02')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create_project')
  create(@Body() createDto: CreateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.create(req.user.id, createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_all_projects')
  findAll(@Req() req: RequestWithUser) {
    return this.projectsService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_user_projects')
  findAllByUser(@Req() req: RequestWithUser) {
    return this.projectsService.findAllByUser(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_project')
  findOne(@Query('id', ParseIntPipe) id: number, @Req() req: RequestWithUser) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('patch_project')
  update(@Body() updateDto: UpdateProjectDto, @Req() req: RequestWithUser) {
    return this.projectsService.update(req.user.id, updateDto);
  }
}
