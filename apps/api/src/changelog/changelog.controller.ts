import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChangelogService } from './changelog.service';
import { CreateChangelogDto } from './dto/create-changelog.dto';
import { UpdateChangelogDto } from './dto/update-changelog.dto';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';

@Controller('test04')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @UseGuards(JwtAuthGuard)
  @Post('create_changelog')
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createDto: CreateChangelogDto) {
    return this.changelogService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_all_change_log')
  @HttpCode(HttpStatus.OK)
  findAll() {
    return this.changelogService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_change_log')
  @HttpCode(HttpStatus.OK)
  findOne(@Query('id') id: string) {
    return this.changelogService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @Patch('update_change_log')
  @HttpCode(HttpStatus.OK)
  update(@Body() updateDto: UpdateChangelogDto) {
    return this.changelogService.update(updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_change_log_by_project')
  @HttpCode(HttpStatus.OK)
  findByProjectId(@Query('projectId') projectId: string) {
    return this.changelogService.findByProjectId(Number(projectId));
  }
}
