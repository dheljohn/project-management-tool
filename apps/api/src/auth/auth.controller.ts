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
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { randomBytes } from 'crypto';
import { getAuthCookieOptions } from './cookie-options.util';


@Controller('testlogin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@Req() req: Request) {
    return req.user;
  }

  @SkipCsrf()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @Post()
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginUserDto, res);
  }

  @SkipCsrf()
  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const csrfToken = randomBytes(32).toString('hex');

    const { secure, sameSite } = getAuthCookieOptions();
    res.cookie('csrf_token', csrfToken, { httpOnly: false, secure, sameSite });

    return { success: true };
  }

  @SkipCsrf()
  @Post('/logout')
  logout(@Res({ passthrough: true }) res: Response) {
    const { secure, sameSite } = getAuthCookieOptions();

    res.clearCookie('auth_token', { httpOnly: true, secure, sameSite });
    res.clearCookie('csrf_token', { httpOnly: false, secure, sameSite });

    return { success: true };
  }
}
