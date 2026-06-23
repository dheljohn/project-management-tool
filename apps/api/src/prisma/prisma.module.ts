import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Global scope
@Module({
  providers: [PrismaService],
  exports: [PrismaService], // Export PrismaService
})
export class PrismaModule {}
