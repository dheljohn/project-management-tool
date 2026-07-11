import { Controller, Get, Res } from '@nestjs/common';
import type { Response } from 'express';
import { PrismaService } from './prisma/prisma.service';
import { CacheHelper } from './common/cache/cache.helper';

@Controller()
export class AppController {
  constructor(
    private readonly prisma: PrismaService,
    private cacheHelper: CacheHelper,
  ) {}

  @Get('health')
  async check(@Res() res: Response) {
    const [dbHealthy, redisHealthy] = await Promise.all([
      this.prisma.$queryRaw`SELECT 1`.then(() => true).catch(() => false),
      this.cacheHelper.checkHealth(),
    ]);

    const healthy = dbHealthy && redisHealthy;

    return res.status(healthy ? 200 : 503).json({
      status: healthy ? 'ok' : 'down',
      db: dbHealthy ? 'up' : 'down',
      redis: redisHealthy ? 'up' : 'down',
      timestamp: new Date().toISOString(),
    });
  }
}
