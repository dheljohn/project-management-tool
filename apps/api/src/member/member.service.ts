// import {
//   Injectable,
//   NotFoundException,
//   ConflictException,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { PrismaService } from '../prisma/prisma.service';
// import { CreateMemberDto } from './dto/create-member.dto';
// import { UpdateMemberDto } from './dto/update-member.dto';
// import * as bcrypt from 'bcrypt';

// import { InjectRepository } from '@nestjs/typeorm';
// import { Member } from '../../database/src/Entities/member.entity';
// import { Repository } from 'typeorm';

// @Injectable()
// export class MemberService {
//   constructor(
//     private prisma: PrismaService,
//     @InjectRepository(Member) private userRepository: Repository<Member>,
//   ) {}

//   async create(createDto: CreateMemberDto) {
//     const normalizedEmail = createDto.email.toLowerCase();
//     const normalizedUserId = createDto.user_id.toLowerCase();

//     const hashed = await bcrypt.hash(createDto.password, 10);

//     try {
//       const created = await this.prisma.member.create({
//         data: {
//           ...createDto,
//           email: normalizedEmail,
//           user_id: normalizedUserId,
//           password: hashed,
//         },
//       });
//       //implied type SafeUser rather than
//       //* const { password, ...safe } = created;
//       type SafeUser = Omit<typeof created, 'password'>;
//       const safe = created as SafeUser;

//       return safe;
//     } catch (err) {
//       if (
//         err instanceof Prisma.PrismaClientKnownRequestError &&
//         err.code === 'P2002'
//       ) {
//         const target = err.meta?.target;
//         if (
//           Array.isArray(target) &&
//           target.every((item): item is string => typeof item === 'string')
//         ) {
//           if (target.includes('email')) {
//             throw new ConflictException('Email already in use');
//           }
//           if (target.includes('user_id')) {
//             throw new ConflictException('User ID already taken');
//           }
//         }

//         throw new ConflictException('Account already exists');
//       }
//       throw err;
//     }
//   }

//   async findAll() {
//     const member = await this.prisma.member.findMany({
//       omit: { password: true },
//     });
//     if (member.length === 0) throw new NotFoundException('No members found');
//     return member;
//   }

//   async findOne(id: number) {
//     const member = await this.prisma.member.findUnique({
//       where: { id },
//       omit: { password: true },
//     });
//     if (!member) throw new NotFoundException('Member not found');
//     return member;
//   }

//   async update(updateDto: UpdateMemberDto) {
//     const member = await this.prisma.member.findUnique({
//       where: { user_id: updateDto.user_id },
//     });

//     if (!member) {
//       throw new NotFoundException('Member not found');
//     }

//     // Verify the old password matches the database hash
//     const isPasswordValid = await bcrypt.compare(
//       updateDto.old_password,
//       member.password,
//     );
//     if (!isPasswordValid) {
//       throw new UnauthorizedException(
//         'The old password you entered is incorrect',
//       );
//     }

//     const hashedNewPassword = await bcrypt.hash(updateDto.new_password, 10);

//     const updated = await this.prisma.member.update({
//       where: { user_id: updateDto.user_id },
//       data: {
//         ...(updateDto.email && { email: updateDto.email }),
//         password: hashedNewPassword,
//       },
//     });
//     // implied SafeUpdated rather than
//     // const { password: _pw, ...safe } = updated;
//     type SafeUpdated = Omit<typeof updated, 'password'>;
//     const safeUp = updated as SafeUpdated;
//     return safeUp;
//   }
//   async deleteByUserId(user_id: string) {
//     return this.prisma.member.deleteMany({
//       where: { user_id },
//     });
//   }
// }

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
    private readonly memberRepository: Repository<Member>,
  ) {}

  // async create(createDto: CreateMemberDto) {
  //   const normalizedEmail = createDto.email.toLowerCase();
  //   const normalizedUserId = createDto.user_id.toLowerCase();

  //   const hashed = await bcrypt.hash(createDto.password, 10);

  //   const member = this.memberRepository.create({
  //     ...createDto,
  //     email: normalizedEmail,
  //     user_id: normalizedUserId,
  //     password: hashed,
  //   });
  //   const existing = await this.memberRepository.findOne({
  //     where: { user_id: normalizedUserId },
  //   });

  //   if (existing) {
  //     throw new ConflictException('A member with this user ID already exists');
  //   }

  //   try {
  //     const created = await this.memberRepository.save(member);

  //     const { password: _password, ...safe } = created;

  //     return safe;
  //   } catch (err) {
  //     // catch (err) {
  //     //   // PostgreSQL unique constraint violation
  //     //   if (err instanceof Error && 'code' in err && err.code === '23505') {
  //     //     if (err instanceof Error && 'detail' in err) {
  //     //       const detail = String(err.detail);

  //     //       if (detail.includes('email')) {
  //     //         throw new ConflictException('Email already in use');
  //     //       }

  //     //       if (detail.includes('user_id')) {
  //     //         throw new ConflictException('User ID already taken');
  //     //       }
  //     //     }

  //     //     throw new ConflictException('Account already exists');
  //     //   }

  //     //   throw err;
  //     // }
  //     // MySQL/MariaDB unique constraint violation
  //     if (
  //       err instanceof Error &&
  //       'code' in err &&
  //       err.code === 'ER_DUP_ENTRY'
  //     ) {
  //       const sqlMessage = 'sqlMessage' in err ? String(err.sqlMessage) : '';

  //       if (sqlMessage.includes('email')) {
  //         throw new ConflictException('Email already in use');
  //       }

  //       if (sqlMessage.includes('user_id')) {
  //         throw new ConflictException('User ID already taken');
  //       }

  //       throw new ConflictException('Account already exists');
  //     }

  //     throw err;
  //   }
  // }

  async create(createDto: CreateMemberDto) {
    const normalizedEmail = createDto.email.toLowerCase();
    const normalizedUserId = createDto.user_id.toLowerCase();

    this.logger.debug(
      `create() called — user_id="${normalizedUserId}", email="${normalizedEmail}"`,
    );

    // 1. Pre-check for existing user_id or email (fast-path UX, not the safety guarantee)
    this.logger.debug(`Checking for existing member with user_id or email...`);
    const existing = await this.memberRepository.findOne({
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

    // 2. Hash password
    const hashed = await bcrypt.hash(createDto.password, 10);
    this.logger.debug(`Password hashed successfully`);

    // 3. Build entity
    const member = this.memberRepository.create({
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

    // 4. Save to DB — the actual atomic guarantee lives in the UNIQUE INDEX,
    // this catch is just the translation layer for when the race happens
    try {
      this.logger.debug(`Attempting save() for user_id="${normalizedUserId}"`);
      const created = await this.memberRepository.save(member);
      this.logger.log(
        `Member created successfully — id=${created.id}, user_id="${created.user_id}"`,
      );
      const safeUser = PublicMemberSchema.parse(member);
      // const { password: _password, ...safe } = created;
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

        // Match the actual key name (e.g. "for key 'member.IDX_member_email'")
        // instead of a loose substring check — safer against edge-case input values
        // that might themselves contain "email" or "user_id".
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
    const members = await this.memberRepository.find();

    if (members.length === 0) {
      throw new NotFoundException('No members found');
    }
    const safeMembers = members.map((members) =>
      PublicMemberSchema.parse(members),
    );
    return safeMembers;
    // return members.map(({ password: _password, ...member }) => member);
  }

  async findOne(id: number) {
    const member = await this.memberRepository.findOne({
      where: { id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // const { password: _password, ...safe } = member;
    // return safe;

    const safeUser = PublicMemberSchema.parse(member);
    return safeUser;
  }

  async update(updateDto: UpdateMemberDto) {
    const member = await this.memberRepository.findOne({
      where: {
        user_id: updateDto.user_id,
      },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    // Verify the old password against the database hash
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
      const updated = await this.memberRepository.save(member);
      const updatedSafe = PublicMemberSchema.parse(updated);
      // const { password, ...safe } = updated;

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
    // catch (err) {
    //   if (err instanceof Error && 'code' in err && err.code === '23505') {
    //     throw new ConflictException('Email already in use');
    //   }

    //   throw err;
    // }
  }

  async deleteByUserId(user_id: string) {
    const result = await this.memberRepository.delete({
      user_id,
    });

    if (result.affected === 0) {
      throw new NotFoundException('Member not found');
    }

    return result;
  }
}
