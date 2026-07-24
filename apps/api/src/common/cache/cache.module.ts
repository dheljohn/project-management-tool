import { Global, Module } from '@nestjs/common';
import { CacheHelper } from './cache.helper';
import KeyvRedis, { Keyv } from '@keyv/redis';
new Keyv({ store: new KeyvRedis(process.env.REDIS_URL), namespace: 'myapp' });

@Global()
@Module({
  providers: [CacheHelper],
  exports: [CacheHelper],
})
export class CacheHelperModule {}
