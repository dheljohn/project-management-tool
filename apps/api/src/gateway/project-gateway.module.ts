import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ProjectGateway } from './project.gateway';
import { PrismaModule } from '../prisma/prisma.module';
import { TypeOrmModule } from '@nestjs/typeorm';
// import { Member } from '../../database/src/Entities/member.entity';
import { ProjectMember } from '../../database/src/Entities/project-member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([ProjectMember]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_ACCESS_SECRET'),
      }),
    }),
    PrismaModule,
  ],
  providers: [ProjectGateway],
  exports: [ProjectGateway],
})
export class ProjectGatewayModule {}
