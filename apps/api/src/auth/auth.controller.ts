import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('testlogin')
  login(@Body() loginUserDto: LoginUserDto) {
    //calls login in service
    return this.authService.login(loginUserDto);
  }
}
