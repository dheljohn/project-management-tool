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
  @HttpCode(HttpStatus.CREATED)
  @Post('create_changelog')
  create(@Body() createDto: CreateChangelogDto) {
    return this.changelogService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('get_all_change_log')
  findAll() {
    return this.changelogService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('get_change_log')
  findOne(@Query('id') id: string) {
    return this.changelogService.findOne(Number(id));
  }

  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update_change_log')
  update(@Body() updateDto: UpdateChangelogDto) {
    return this.changelogService.update(updateDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_change_log_by_project')
  getChangeLogByProject(
    @Query('projectId', ParseIntPipe) projectId: number,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('field') field?: string,
  ) {
    return this.changelogService.findByProjectId(
      projectId,
      cursor ? Number(cursor) : undefined,
      limit ? Number(limit) : 10,
      field,
    );
  }
}
