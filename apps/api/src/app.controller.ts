import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';

@Controller()
export class AppController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('health')
  health() {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }

  @Get('health/db')
  async healthDb() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'ok',
        db: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: 'ok',
        db: 'unreachable',
        timestamp: new Date().toISOString(),
      };
    }
  }
}
