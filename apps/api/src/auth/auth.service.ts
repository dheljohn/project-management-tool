import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response, Request } from 'express';
import { randomBytes } from 'crypto';
import { getAuthCookieOptions } from './cookie-options.util';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(loginDto: LoginUserDto, res: Response) {
    const member = await this.prisma.member.findUnique({
      where: { user_id: loginDto.user_id },
    });

    // Constant-time compare even when member is not found (timing-safe)
    const dummyHash = '$2b$10$invalidsaltinvalidsaltinvalidsalt';
    const isMatch = await bcrypt.compare(
      loginDto.password,
      member?.password ?? dummyHash,
    );

    if (!isMatch || !member) {
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.issueTokenPair(member.id, member.user_id, res);

    return { user_id: member.user_id };
  }

  async refresh(req: Request, res: Response) {
    const rawToken: string | undefined = req.cookies?.['refresh_token'];
    if (!rawToken) throw new UnauthorizedException('No refresh token');

    // Verify signature & expiry
    let payload: { sub: number; user_id: string; jti: string };
    try {
      payload = this.jwtService.verify(rawToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Validate the jti against the DB
    const stored = await this.prisma.refreshToken.findUnique({
      where: { jti: payload.jti },
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // If jti was already revoked/used and someone is replaying it,
      // revoke the entire family (all tokens for this user) as a precaution.
      if (stored?.revokedAt) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      }
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotate: revoke the old token
    await this.prisma.refreshToken.update({
      where: { jti: payload.jti },
      data: { revokedAt: new Date() },
    });

    // Issue new pair
    await this.issueTokenPair(payload.sub, payload.user_id, res);

    return { success: true };
  }

  async logout(req: Request, res: Response) {
    const rawToken: string | undefined = req.cookies?.['refresh_token'];

    if (rawToken) {
      try {
        const payload: { jti: string } = this.jwtService.verify(rawToken, {
          secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
        });
        // Revoke the specific token so a stolen cookie is invalidated immediately
        await this.prisma.refreshToken.updateMany({
          where: { jti: payload.jti, revokedAt: null },
          data: { revokedAt: new Date() },
        });
      } catch {
        // Token already expired or invalid — nothing to revoke in DB
      }
    }

    const { secure, sameSite } = getAuthCookieOptions();
    res.clearCookie('auth_token', { httpOnly: true, secure, sameSite });
    res.clearCookie('refresh_token', { httpOnly: true, secure, sameSite, path: '/api/testlogin/refresh' });
    res.clearCookie('csrf_token', { httpOnly: false, secure, sameSite });

    return { success: true };
  }

  private async issueTokenPair(userId: number, user_id: string, res: Response) {
    const { secure, sameSite } = getAuthCookieOptions();
    const csrfToken = randomBytes(32).toString('hex');
    const jti = randomBytes(16).toString('hex');

    const accessPayload = { sub: userId, user_id };
    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: '15m',
    });

    const refreshPayload = { sub: userId, user_id, jti };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });

    // Persist the refresh token jti so we can revoke it
    await this.prisma.refreshToken.create({
      data: {
        jti,
        userId,
        expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
      },
    });

    res.cookie('auth_token', accessToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: ACCESS_TOKEN_TTL_MS,
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: REFRESH_TOKEN_TTL_MS,
      path: '/api/testlogin/refresh',
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: REFRESH_TOKEN_TTL_MS,
    });
  }
}
