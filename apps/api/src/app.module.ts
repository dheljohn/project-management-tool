// src/app.module.ts

import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
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
import { createKeyv } from '@keyv/redis';
import { CacheHelperModule } from './common/cache/cache.module';

import { CsrfGuard } from './common/guards/csrf.guard';
import { InviteModule } from './invite/invite.module';
import { ProjectGatewayModule } from './gateway/project-gateway.module';
import { SentryModule } from '@sentry/nestjs/setup';

import { APP_FILTER } from '@nestjs/core';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';

@Module({
  imports: [
    SentryModule.forRoot(),
    ProjectGatewayModule,
    CacheModule.registerAsync({
      isGlobal: true,
      useFactory: () => ({
        stores: [createKeyv(process.env.REDIS_URL)],
        ttl: 30000,
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
    InviteModule,
  ],
  controllers: [AppController, MemberController],

  providers: [
    PrismaService,
    MemberService,
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
