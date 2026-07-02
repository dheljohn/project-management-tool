// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma/prisma.service';
import { MemberService } from './member/member.service';
import { MemberController } from './member/member.controller';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TaskModule } from './task/task.module';
import { ChangelogModule } from './changelog/changelog.module';
import { SeedModule } from './seed/seed.module';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';

import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheHelperModule } from './common/cache/cache.module';

@Module({
  imports: [
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: async () => ({
        store: await redisStore({ url: process.env.REDIS_URL }),
        ttl: 30000, // 30s default
      }),
    }),
    CacheHelperModule,
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    ProjectsModule,
    TaskModule,
    ChangelogModule,
    SeedModule,
  ],
  controllers: [AppController, MemberController],

  providers: [
    AppService,
    PrismaService,
    MemberService,
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
  ],
})
export class AppModule {}
