import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  Get,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { CreateMemberDto } from './dto/create-member.dto';

@Controller('test01')
export class MemberController {
  constructor(private readonly memberService: MemberService) {}

  // @Post('create_member')
  // createMember(@Body() createMemberDto: CreateMemberDto) {
  //   return this.authService.createMember(createMemberDto);
  // }
}
