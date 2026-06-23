import {
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CreateMemberDto } from './dto/create-member.dto';
// import { Model, Prisma } from '../../generated/prisma';

@Injectable()
export class MemberService {
  constructor(private readonly prisma: PrismaService) {}

  async create(creatememberDto: CreateMemberDto) {
    const { password, ...member } = creatememberDto;
    const hashedPassword = bcrypt.hashSync(password, 10);
    return await this.prisma.member.create({
      data: { password: hashedPassword, ...member },
    });
  }

  findByEmail(email: string) {
    return this.prisma.member.findUnique({ where: { email } });
  }

  // async register(createMemberDto: CreateMemberDto) {
  //   const { password, ...member } = createMemberDto;
  //   const saltRounds = 10;
  //   const hashedPassword = await bcrypt.hash(password, saltRounds);

  //   try {
  //     const newMember = await this.prisma.member.create({
  //       data: {
  //         user_id,
  //         email,
  //         password: hashedPassword,
  //       },
  //     });

  //     // 3. Strip the password out of the response object for security
  //     const { password: _, ...result } = newMember;
  //     return result;
  //   } catch (error: any) {
  //     // 4. Handle Prisma unique constraint violations (e.g., email already exists)
  //     // P2002 is the Prisma error code for unique constraint failures
  //     if (error.code === 'P2002') {
  //       throw new ConflictException('Email is already registered');
  //     }

  //     throw new InternalServerErrorException(
  //       'Something went wrong during registration',
  //     );
  //   }
  // }
}
