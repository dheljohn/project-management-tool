import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateMemberDto } from 'src/member/dto/create-member.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  loginMember() {}

  @Post('register')
  createMember(@Body() createMemberDto: CreateMemberDto) {
    return this.authService.createMember(createMemberDto);
  }
}
