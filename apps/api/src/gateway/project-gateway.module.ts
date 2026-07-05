import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ProjectGateway } from './project.gateway';
import { PrismaModule } from 'src/prisma/prisma.module';

@Module({
  imports: [
    // registerAsync defers evaluation to runtime (inside useFactory),
    // by which point ConfigModule has already loaded .env into
    // process.env. A plain JwtModule.register({...}) evaluates its
    // argument immediately at import time — before .env is loaded —
    // which is why process.env.JWT_SECRET was undefined before.
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
      }),
    }),
    PrismaModule,
  ],
  providers: [ProjectGateway],
  exports: [ProjectGateway],
})
export class ProjectGatewayModule {}
