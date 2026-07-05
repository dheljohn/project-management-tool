import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { randomBytes } from 'crypto';
import { getAuthCookieOptions } from './cookie-options.util';

@Injectable()
export class AuthService {
  //core login func here
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto, res: Response) {
    const member = await this.prisma.member.findUnique({
      where: { user_id: loginDto.user_id },
    });

    if (!member) throw new UnauthorizedException('Invalid credentials');

    const isMatch = member
      ? await bcrypt.compare(loginDto.password, member.password)
      : await bcrypt.compare(
          loginDto.password,
          '$2b$10$invalidsaltinvalidsaltinvalidsalt',
        );

    if (!isMatch || !member)
      throw new UnauthorizedException('Invalid credentials');

    const payload = {
      sub: member.id,
      email: member.email,
      user_id: member.user_id,
    };
    const token = await this.jwtService.signAsync(payload);
    const csrfToken = randomBytes(32).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';

    const { secure, sameSite } = getAuthCookieOptions();

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure,
      sameSite,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure,
      sameSite,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { user_id: member.user_id };
  }
}
