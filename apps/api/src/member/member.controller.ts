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
import { ApiHeader } from '@nestjs/swagger';

@Controller('test01')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @SkipCsrf()
  @HttpCode(HttpStatus.CREATED)
  @Post('create_member')
  create(@Body() createDto: CreateMemberDto) {
    return this.memberService.create(createDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_all_member')
  findAll() {
    return this.memberService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @Get('get_member')
  findOne(@Query('id') id: string) {
    return this.memberService.findOne(Number(id));
  }

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
