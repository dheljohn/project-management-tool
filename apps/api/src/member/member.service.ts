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
    return this.prisma.member.findMany();
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({ where: { id } });
    if (!member) throw new NotFoundException('Member not found');
    return member;
  }

  // async update(id: number, dto: UpdateMemberDto) {
  //   await this.findOne(id); // 404 guard

  //   if (dto.password) {
  //     dto.password = await bcrypt.hash(dto.password, 10);
  //   }

  //   return this.prisma.member.update({
  //     where: { id },
  //     data: dto,
  //   });
  // }

  async update(updateDto: UpdateMemberDto) {
    // // 1. Convert user_id to a number if your Prisma schema uses Int IDs
    // const numericId = Number(dto.user_id);
    // if (isNaN(numericId)) {
    //   throw new NotFoundException('Invalid user ID format');
    // }

    // 2. Fetch the existing user from the database
    const member = await this.prisma.member.findUnique({
      where: { user_id: updateDto.user_id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // 3. Verify the old password matches the database hash
    const isPasswordValid = await bcrypt.compare(
      updateDto.old_password,
      member.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'The old password you entered is incorrect',
      );
    }

    // 4. Hash the new password
    const hashedNewPassword = await bcrypt.hash(updateDto.new_password, 10);

    // 5. Update the record in the database
    return this.prisma.member.update({
      where: { user_id: updateDto.user_id },
      data: {
        email: updateDto.email,
        password: hashedNewPassword,
      },
    });
  }
}
