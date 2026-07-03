import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { randomBytes } from 'crypto';

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

    const isMatch = await bcrypt.compare(loginDto.password, member.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: member.id, email: member.email };
    const token = await this.jwtService.signAsync(payload);
    const csrfToken = randomBytes(32).toString('hex');
    const isProd = process.env.NODE_ENV === 'production';

    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    res.cookie('csrf_token', csrfToken, {
      httpOnly: false,
      secure: isProd,
      sameSite: isProd ? 'none' : 'lax',
      maxAge: 1000 * 60 * 60 * 24 * 7,
    });

    return { user_id: member.user_id };
  }
}
