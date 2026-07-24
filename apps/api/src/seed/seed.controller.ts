import { Controller, Post } from '@nestjs/common';
import { SeedService } from './seed.service';
import { SkipCsrf } from '../auth/decorators/skip-csrf.decorator';

@Controller('seed')
export class SeedController {
  constructor(private readonly seedService: SeedService) {}

  @SkipCsrf()
  @Post()
  seed() {
    return this.seedService.seed();
  }
}
