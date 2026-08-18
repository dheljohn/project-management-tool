// src/app.module.ts
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv } from '@keyv/redis';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { Module } from '@nestjs/common';
import { SentryModule } from '@sentry/nestjs/setup';
import { SentryGlobalFilter } from '@sentry/nestjs/setup';
import { APP_FILTER } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppController } from './app.controller';
// import { PrismaService } from './prisma/prisma.service';
import { AuthModule } from './auth/auth.module';
// import { PrismaModule } from './prisma/prisma.module';
import { ProjectsModule } from './projects/projects.module';
import { TaskModule } from './task/task.module';
import { ChangelogModule } from './changelog/changelog.module';
import { SeedModule } from './seed/seed.module';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { CacheHelperModule } from './common/cache/cache.module';

import { CsrfGuard } from './common/guards/csrf.guard';
import { InviteModule } from './invite/invite.module';
import { ProjectGatewayModule } from './gateway/project-gateway.module';
import { MembersModule } from './member/member.module';
// import { Member } from '../database/src/Entities/member.entity';
// // import * as fs from 'fs';
// // import * as path from 'path';
// import { Project } from '../database/src/Entities/project.entity';
// import { ProjectMember } from '../database/src/Entities/project-member.entity';
// import { Task } from '../database/src/Entities/task.entity';
// import { TaskAssignee } from '../database/src/Entities/task-assignee.entity';
// import { ChangeLog } from '../database/src/Entities/change-log.entity';
// import { RefreshToken } from '../database/src/Entities/refresh-token.entity';
// import { InviteCode } from '../database/src/Entities/invite-code.entity';

@Module({
  imports: [
    // TypeOrmModule.forRoot({
    //   type: 'mysql',
    //   url: process.env.MYSQL_URL,

    //   entities: [
    //     Member,
    //     Project,
    //     ProjectMember,
    //     Task,
    //     TaskAssignee,
    //     ChangeLog,
    //     RefreshToken,
    //     InviteCode,
    //   ],

    //   synchronize: false,
    // }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql',
        // url: config.getOrThrow<string>('MYSQL_URL'),
        host: config.getOrThrow<string>('DB_HOST'),
        port: config.getOrThrow<number>('DB_PORT'),
        username: config.getOrThrow<string>('DB_USER'),
        password: config.getOrThrow<string>('DB_PASSWORD'),
        database: config.getOrThrow<string>('DB_NAME'),
        // entities: [
        //   Member,
        //   Project,
        //   ProjectMember,
        //   Task,
        //   TaskAssignee,
        //   ChangeLog,
        //   RefreshToken,
        //   InviteCode,
        // ],
        entities: [__dirname + '/../**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),

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
    MembersModule,
    // PrismaModule,
    AuthModule,
    ProjectsModule,
    TaskModule,
    ChangelogModule,
    SeedModule,
    InviteModule,
  ],
  controllers: [AppController],

  providers: [
    // PrismaService,
    { provide: APP_GUARD, useClass: CustomThrottlerGuard },
    { provide: APP_GUARD, useClass: CsrfGuard },
    {
      provide: APP_FILTER,
      useClass: SentryGlobalFilter,
    },
  ],
})
export class AppModule {}
