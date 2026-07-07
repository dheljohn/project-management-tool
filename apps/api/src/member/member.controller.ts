import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  Delete,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { SkipCsrf } from 'src/auth/decorators/skip-csrf.decorator';
import { ApiHeader, ApiCookieAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('members')
@Controller('test01')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @SkipCsrf()
  @HttpCode(HttpStatus.CREATED)
  @Post('create_member')
  create(@Body() createDto: CreateMemberDto) {
    return this.memberService.create(createDto);
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_all_member')
  findAll() {
    return this.memberService.findAll();
  }

  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('get_member')
  findOne(@Query('id') id: string) {
    return this.memberService.findOne(Number(id));
  }

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @UseGuards(JwtAuthGuard)
  @Patch('update_member')
  update(@Body() dto: UpdateMemberDto) {
    // Pass the entire DTO to the service layer
    return this.memberService.update(dto);
  }

  @ApiCookieAuth('auth_token')
  @ApiHeader({
    name: 'X-CSRF-Token',
    description: 'Copy from your csrf_token cookie',
  })
  @Delete('test_cleanup')
  testCleanup(@Body() body: { user_id: string; secret: string }) {
    if (process.env.NODE_ENV === 'production') {
      throw new NotFoundException();
    }
    if (body.secret !== process.env.TEST_SECRET) {
      throw new UnauthorizedException();
    }
    return this.memberService.deleteByUserId(body.user_id);
  }
}
