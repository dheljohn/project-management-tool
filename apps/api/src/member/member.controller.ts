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
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('test01')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  @Post('create_member')
  @HttpCode(HttpStatus.CREATED)
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

  @UseGuards(JwtAuthGuard)
  @Patch('update_member')
  update(@Body() dto: UpdateMemberDto) {
    // Pass the entire DTO to the service layer
    return this.memberService.update(dto);
  }
}
