import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

@Injectable()
export class CacheHelper {
  private logger = new Logger(CacheHelper.name);

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 30000,
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined && cached !== null) {
      this.logger.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    this.logger.log(`❌ Cache MISS: ${key}`);
    const fresh = await fetchFn();
    await this.cache.set(key, fresh, ttl);
    return fresh;
  }

  async invalidate(...keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cache.del(key)));
    this.logger.log(`🗑️ Cache invalidated: ${keys.join(', ')}`);
  }
}
