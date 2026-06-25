import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMemberDto) {
    const existing = await this.prisma.member.findUnique({
      where: { email: createDto.email },
    });
    if (existing) throw new ConflictException('Email already in use');

    const hashed = await bcrypt.hash(createDto.password, 10);
    return this.prisma.member.create({
      data: { ...createDto, password: hashed },
    });
  }

  findAll() {
    const member = this.prisma.member.findMany();
    if (!member) throw new NotFoundException('No members found');
    return member;
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  async update(updateDto: UpdateMemberDto) {
    const member = await this.prisma.member.findUnique({
      where: { user_id: updateDto.user_id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Verify the old password matches the database hash
    const isPasswordValid = await bcrypt.compare(
      updateDto.old_password,
      member.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'The old password you entered is incorrect',
      );
    }

    //  Hash new pass
    const hashedNewPassword = await bcrypt.hash(updateDto.new_password, 10);

    // Update database record
    return this.prisma.member.update({
      where: { user_id: updateDto.user_id },
      data: {
        email: updateDto.email,
        password: hashedNewPassword,
      },
    });
  }
}
