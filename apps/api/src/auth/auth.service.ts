import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
// import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response, Request } from 'express';
import { randomBytes } from 'crypto';
import { getAuthCookieOptions } from './cookie-options.util';
import { IsNull, Repository } from 'typeorm';
import { Member } from '../../database/src/Entities/member.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../../database/src/Entities/refresh-token.entity';

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000; // 15 minutes
// const ACCESS_TOKEN_TTL_MS = 1 * 15 * 1000; // 15 seconds
const REFRESH_TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    // private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
  ) {}

  async login(loginDto: LoginUserDto, res: Response) {
    const loginStart = Date.now();

    if (!loginDto?.user_id || !loginDto?.password) {
      this.logger.warn(
        'Login rejected: missing user_id or password in request body',
      );
      throw new BadRequestException('user_id and password are required');
    }

    const normalizedUserId = loginDto.user_id.toLowerCase();
    this.logger.debug(`Login attempt for user_id: ${normalizedUserId}`);

    let existingMember: Member | null;
    try {
      const t0 = Date.now();
      existingMember = await this.memberRepo.findOne({
        where: { user_id: normalizedUserId },
      });
      this.logger.debug(
        `memberRepository.findOne took ${Date.now() - t0}ms — found: ${!!existingMember}`,
      );
    } catch (err) {
      this.logger.error(
        `DB lookup failed during login for user_id: ${normalizedUserId}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('Login temporarily unavailable');
    }

    const dummyHash = '$2b$10$invalidsaltinvalidsaltinvalidsalt';
    let isMatch: boolean;
    try {
      const t1 = Date.now();
      isMatch = await bcrypt.compare(
        loginDto.password,
        existingMember?.password ?? dummyHash,
      );
      this.logger.debug(`bcrypt.compare took ${Date.now() - t1}ms`);
    } catch (err) {
      this.logger.error(
        `bcrypt.compare threw unexpectedly for user_id: ${normalizedUserId}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('Login temporarily unavailable');
    }

    if (!existingMember) {
      this.logger.warn(
        `Login failed — no member found for user_id: ${normalizedUserId}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!isMatch) {
      this.logger.warn(
        `Login failed — password mismatch for memberId: ${existingMember.id}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    try {
      const t2 = Date.now();
      await this.issueTokenPair(existingMember.id, existingMember.user_id, res);
      this.logger.debug(`issueTokenPair took ${Date.now() - t2}ms`);
    } catch (err) {
      this.logger.error(
        `issueTokenPair failed for memberId: ${existingMember.id}`,
        err instanceof Error ? err.stack : String(err),
      );
      throw new InternalServerErrorException('Failed to complete login');
    }

    this.logger.log(
      `Login success: memberId=${existingMember.id} user_id=${existingMember.user_id} (${Date.now() - loginStart}ms)`,
    );

    return { user_id: existingMember.user_id };
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
    // const stored = await this.prisma.refreshToken.findUnique({
    //   where: { jti: payload.jti },
    // });
    const stored = await this.refreshTokenRepo.findOneBy({
      jti: payload.jti,
    });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // If jti was already revoked/used and someone is replaying it,
      // revoke the entire family (all tokens for this user) as a precaution.

      // if (stored?.revokedAt) {
      //   await this.prisma.refreshToken.updateMany({
      //     where: { userId: stored.userId, revokedAt: null },
      //     data: { revokedAt: new Date() },
      //   });
      // }
      if (stored?.revokedAt) {
        await this.refreshTokenRepo.update(
          // where: { userId: stored.userId, revokedAt: null },
          {
            userId: stored.userId,
            revokedAt: IsNull(),
          },
          {
            revokedAt: new Date(),
          },
        );
      }
      throw new UnauthorizedException('Refresh token invalid or expired');
    }

    // Rotate: revoke the old token
    await this.refreshTokenRepo.update(
      { jti: payload.jti },
      { revokedAt: new Date() },
    );

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
        await this.refreshTokenRepo.update(
          { jti: payload.jti, revokedAt: IsNull() },
          { revokedAt: new Date() },
        );
      } catch {
        // Token already expired or invalid
      }
    }

    const { secure, sameSite } = getAuthCookieOptions();
    res.clearCookie('auth_token', { httpOnly: true, secure, sameSite });
    res.clearCookie('refresh_token', {
      httpOnly: true,
      secure,
      sameSite,
      path: '/api/testlogin/refresh',
    });
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
    // await this.prisma.refreshToken.create({
    //   data: {
    //     jti,
    //     userId,
    //     expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
    //   },
    // });
    await this.refreshTokenRepo.save({
      jti,
      userId,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_TTL_MS),
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
