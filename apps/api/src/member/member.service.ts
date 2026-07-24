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
import { Prisma } from '../../generated/prisma/client';

@Injectable()
export class MemberService {
  constructor(private prisma: PrismaService) {}

  async create(createDto: CreateMemberDto) {
    const normalizedEmail = createDto.email.toLowerCase();
    const normalizedUserId = createDto.user_id.toLowerCase();

    const hashed = await bcrypt.hash(createDto.password, 10);

    try {
      const created = await this.prisma.member.create({
        data: {
          ...createDto,
          email: normalizedEmail,
          user_id: normalizedUserId,
          password: hashed,
        },
      });
      //implied type SafeUser rather than
      //* const { password, ...safe } = created;
      type SafeUser = Omit<typeof created, 'password'>;
      const safe = created as SafeUser;

      return safe;
    } catch (err) {
      if (
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002'
      ) {
        const target = err.meta?.target;
        if (
          Array.isArray(target) &&
          target.every((item): item is string => typeof item === 'string')
        ) {
          if (target.includes('email')) {
            throw new ConflictException('Email already in use');
          }
          if (target.includes('user_id')) {
            throw new ConflictException('User ID already taken');
          }
        }

        throw new ConflictException('Account already exists');
      }
      throw err;
    }
  }

  async findAll() {
    const member = await this.prisma.member.findMany({
      omit: { password: true },
    });
    if (member.length === 0) throw new NotFoundException('No members found');
    return member;
  }

  async findOne(id: number) {
    const member = await this.prisma.member.findUnique({
      where: { id },
      omit: { password: true },
    });
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

    const hashedNewPassword = await bcrypt.hash(updateDto.new_password, 10);

    const updated = await this.prisma.member.update({
      where: { user_id: updateDto.user_id },
      data: {
        ...(updateDto.email && { email: updateDto.email }),
        password: hashedNewPassword,
      },
    });
    // implied SafeUpdated rather than
    // const { password: _pw, ...safe } = updated;
    type SafeUpdated = Omit<typeof updated, 'password'>;
    const safeUp = updated as SafeUpdated;
    return safeUp;
  }
  async deleteByUserId(user_id: string) {
    return this.prisma.member.deleteMany({
      where: { user_id },
    });
  }
}
