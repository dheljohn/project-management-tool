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
import { ApiHeader, ApiQuery, ApiCookieAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';

@ApiTags('changelog')
@Controller('test04')
export class ChangelogController {
  constructor(private readonly changelogService: ChangelogService) {}

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  @Post('create_changelog')
  create(
    @Body() createDto: CreateChangelogDto,
    @CurrentUser() user: { id: number; user_id: string },
  ) {
    return this.changelogService.create(createDto, user.id, user.user_id);
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('get_all_change_log')
  findAll() {
    return this.changelogService.findAll();
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Get('get_change_log')
  findOne(@Query('id') id: string) {
    return this.changelogService.findOne(Number(id));
  }

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @Patch('update_change_log')
  update(@Body() updateDto: UpdateChangelogDto) {
    return this.changelogService.update(updateDto);
  }

  @ApiCookieAuth('auth_token')
  @ApiQuery({ name: 'projectId', type: Number, required: true, example: 30 })
  @ApiQuery({
    name: 'cursor',
    type: Number,
    required: false,
    description: 'ID of the last item from the previous page',
  })
  @ApiQuery({ name: 'limit', type: Number, required: false, example: 10 })
  @ApiQuery({
    name: 'field',
    type: String,
    required: false,
    example: 'status',
    description: 'Filter by changelog field type',
  })
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
