import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiCookieAuth,
  ApiResponse,
  ApiBody,
  ApiHeader,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import type { Response, Request } from 'express';
import { JwtAuthGuard } from 'src/common/guards/jwt-auth.guard';
import { Throttle } from '@nestjs/throttler';
import { SkipCsrf } from './decorators/skip-csrf.decorator';
import { randomBytes } from 'crypto';
import { getAuthCookieOptions } from './cookie-options.util';

@ApiTags('auth')
@Controller('testlogin')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ─── GET /me ─────────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiCookieAuth('auth_token')
  @ApiResponse({
    status: 200,
    description:
      'Returns the authenticated user payload from the access token.',
  })
  @ApiResponse({ status: 401, description: 'Access token missing or invalid.' })
  @UseGuards(JwtAuthGuard)
  @Get('/me')
  me(@Req() req: Request) {
    return req.user;
  }

  @ApiOperation({ summary: 'Get access token for socket auth' })
  @ApiCookieAuth('auth_token')
  @UseGuards(JwtAuthGuard)
  @Get('/socket-token')
  getSocketToken(@Req() req: Request) {
    return { token: req.cookies.auth_token };
  }

  // ─── POST /login ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Log in with user_id and password' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description:
      'Login successful. Sets two httpOnly cookies: ' +
      'auth_token (access token, 15 min) and refresh_token (7 days). ' +
      'Also sets a csrf_token cookie (non-httpOnly) for the CSRF double-submit pattern.',
  })
  @ApiResponse({ status: 401, description: 'Invalid credentials.' })
  @ApiResponse({
    status: 429,
    description: 'Rate limit exceeded (max 5 login attempts per minute).',
  })
  @SkipCsrf()
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  @HttpCode(HttpStatus.OK)
  @Post()
  login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    return this.authService.login(loginUserDto, res);
  }

  // ─── POST /refresh ────────────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Refresh the access token',
    description:
      'Reads the refresh_token cookie, validates it against the stored ' +
      '(non-revoked, non-expired) RefreshToken record, rotates the refresh token ' +
      '(old jti is revoked immediately), and issues a new access + refresh token pair as httpOnly cookies. ' +
      'CSRF is not required here — the refresh_token cookie is already httpOnly and ' +
      'path-scoped to this endpoint, which provides equivalent protection.',
  })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({
    status: 200,
    description:
      'Token rotation successful. New auth_token (15 min) and refresh_token (7 days) cookies are set.',
  })
  @ApiResponse({
    status: 401,
    description:
      'Refresh token missing, invalid signature, expired, or already revoked. ' +
      'If a revoked token is replayed, all tokens for that user are invalidated immediately.',
  })
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @Post('/refresh')
  refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.refresh(req, res);
  }

  // ─── POST /logout ─────────────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Log out',
    description:
      'Clears the auth_token, refresh_token, and csrf_token cookies. ' +
      'Also sets revokedAt on the matching RefreshToken database record so that ' +
      'a stolen refresh cookie cannot be replayed after logout.',
  })
  @ApiCookieAuth('auth_token')
  @ApiResponse({
    status: 200,
    description: 'Logged out. All cookies cleared and refresh token revoked.',
  })
  @SkipCsrf()
  @HttpCode(HttpStatus.OK)
  @Post('/logout')
  logout(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    return this.authService.logout(req, res);
  }

  // ─── GET /csrf-token ──────────────────────────────────────────────────────────

  @ApiOperation({
    summary: 'Obtain a CSRF token',
    description:
      'Sets a new csrf_token cookie (non-httpOnly). ' +
      'The frontend middleware calls this automatically for sessions that lack a CSRF cookie. ' +
      'Copy the value to use as the x-csrf-token header in Swagger UI.',
  })
  @ApiResponse({
    status: 200,
    description: 'csrf_token cookie set. Response body: { success: true }.',
  })
  @SkipCsrf()
  @Get('csrf-token')
  getCsrfToken(@Res({ passthrough: true }) res: Response) {
    const csrfToken = randomBytes(32).toString('hex');
    const { secure, sameSite } = getAuthCookieOptions();
    res.cookie('csrf_token', csrfToken, { httpOnly: false, secure, sameSite });
    return { success: true };
  }
}
