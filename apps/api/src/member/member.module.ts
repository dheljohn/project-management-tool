import { Module } from '@nestjs/common';
import { MemberController } from './member.controller'; // [YOUR CONTROLLER]
import { MemberService } from './member.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [MemberController],
  providers: [MemberService, PrismaModule],
})
export class MemberModule {}
