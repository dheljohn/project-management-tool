import {
  Injectable,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateMemberDto } from './dto/create-member.dto';
import { UpdateMemberDto } from './dto/update-member.dto';
import { Member } from '../../database/src/Entities/member.entity';
import { PublicMemberSchema } from '../schemas/member.schema';

@Injectable()
export class MemberService {
  private readonly logger = new Logger(MemberService.name);
  constructor(
    @InjectRepository(Member)
    private readonly memberRepo: Repository<Member>,
  ) {}

  async create(createDto: CreateMemberDto) {
    const normalizedEmail = createDto.email.toLowerCase();
    const normalizedUserId = createDto.user_id.toLowerCase();

    this.logger.debug(
      `create() called — user_id="${normalizedUserId}", email="${normalizedEmail}"`,
    );

    this.logger.debug(`Checking for existing member with user_id or email...`);
    const existing = await this.memberRepo.findOne({
      where: [{ user_id: normalizedUserId }, { email: normalizedEmail }],
    });
    if (existing) {
      const conflictField =
        existing.user_id === normalizedUserId ? 'user_id' : 'email';
      this.logger.warn(
        `Pre-check found conflict on "${conflictField}" for user_id="${normalizedUserId}" (existing.id=${existing.id})`,
      );
      throw new ConflictException(
        conflictField === 'user_id'
          ? 'A member with this user ID already exists'
          : 'Email already in use',
      );
    }
    this.logger.debug(`No existing member found — proceeding to hash password`);

    const hashed = await bcrypt.hash(createDto.password, 10);
    this.logger.debug(`Password hashed successfully`);

    const member = this.memberRepo.create({
      ...createDto,
      email: normalizedEmail,
      user_id: normalizedUserId,
      password: hashed,
    });
    this.logger.debug(
      `Entity built in memory: ${JSON.stringify({
        user_id: member.user_id,
        email: member.email,
        username: member.username ?? null,
      })}`,
    );

    try {
      this.logger.debug(`Attempting save() for user_id="${normalizedUserId}"`);
      const created = await this.memberRepo.save(member);
      this.logger.log(
        `Member created successfully — id=${created.id}, user_id="${created.user_id}"`,
      );
      const safeUser = PublicMemberSchema.parse(member);
      return safeUser;
    } catch (err) {
      this.logger.error(
        `save() failed for user_id="${normalizedUserId}": ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
      if (
        err instanceof Error &&
        'code' in err &&
        err.code === 'ER_DUP_ENTRY'
      ) {
        const sqlMessage = 'sqlMessage' in err ? String(err.sqlMessage) : '';
        this.logger.warn(
          `Race-condition duplicate caught at save() — sqlMessage: "${sqlMessage}"`,
        );

        const keyMatch = sqlMessage.match(/for key '([^']+)'/);
        const keyName = (keyMatch?.[1] ?? '').toLowerCase();

        if (keyName.includes('email')) {
          throw new ConflictException('Email already in use');
        }
        if (keyName.includes('user_id')) {
          throw new ConflictException('User ID already taken');
        }

        this.logger.warn(
          `ER_DUP_ENTRY caught but key name didn't match a known field — sqlMessage: "${sqlMessage}"`,
        );
        throw new ConflictException('Account already exists');
      }
      throw err;
    }
  }

  async findAll() {
    const members = await this.memberRepo.find();

    if (members.length === 0) {
      throw new NotFoundException('No members found');
    }
    const safeMembers = members.map((members) =>
      PublicMemberSchema.parse(members),
    );
    return safeMembers;
  }

  async findOne(id: number) {
    const member = await this.memberRepo.findOne({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const safeUser = PublicMemberSchema.parse(member);
    return safeUser;
  }

  async update(updateDto: UpdateMemberDto) {
    const member = await this.memberRepo.findOne({
      where: {
        user_id: updateDto.user_id,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

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

    member.password = hashedNewPassword;

    if (updateDto.email) {
      member.email = updateDto.email;
    }

    try {
      const updated = await this.memberRepo.save(member);
      const updatedSafe = PublicMemberSchema.parse(updated);

      return updatedSafe;
    } catch (err) {
      if (
        err instanceof Error &&
        'code' in err &&
        err.code === 'ER_DUP_ENTRY'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async deleteByUserId(user_id: string) {
    const result = await this.memberRepo.delete({
      user_id,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Member not found');
    }

    return result;
  }
}
