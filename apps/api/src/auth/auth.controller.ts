import {
  Controller,
  Post,
  Body,
  Res,
  Get,
  UseGuards,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';

@Controller('testlogin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@Req() req: Request) {
    return req.user;
  }

  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginUserDto, res);
  }

  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('auth_token');
    return { success: true };
  }
}
