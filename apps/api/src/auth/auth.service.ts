import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginUserDto } from './dto/login-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  //core login func here
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginUserDto) {
    const member = await this.prisma.member.findUnique({
      where: { user_id: loginDto.user_id },
    });

    if (!member) throw new UnauthorizedException('Invalid credentials');

    const isMatch = await bcrypt.compare(loginDto.password, member.password);
    if (!isMatch) throw new UnauthorizedException('Invalid credentials');

    const payload = { sub: member.id, email: member.email };
    const token = await this.jwtService.signAsync(payload);

    return { access_token: token };
  }
}
