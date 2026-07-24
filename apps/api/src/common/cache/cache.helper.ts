import { Inject, Injectable } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';

interface KeyvIteratorStore {
  _namespace: string | undefined;
  opts?: {
    store?: {
      constructor: { name: string };
    };
  };
  iterator?: (namespace?: string) => AsyncGenerator<[string, unknown]>;
}
@Injectable()
export class CacheHelper {
  // private logger = new Logger(CacheHelper.name);

  constructor(@Inject(CACHE_MANAGER) private cache: Cache) {}

  async invalidatePattern(pattern: string): Promise<void> {
    // const stores = this.cache.stores as any[];
    const stores = this.cache.stores as unknown as
      KeyvIteratorStore[] | KeyvIteratorStore;

    const store: KeyvIteratorStore | undefined = Array.isArray(stores)
      ? stores[0]
      : stores;

    // const start = Date.now();
    // this.logger.log(
    //   `invalidatePattern(${pattern}) took ${Date.now() - start}ms`,
    // );

    if (store && typeof store.iterator === 'function') {
      const prefix = pattern.replace(/\*$/, ''); // strip trailing wildcard
      const matchedKeys: string[] = [];

      for await (const [key] of store.iterator(store._namespace ?? undefined)) {
        // Keyv prefixes keys internally with "keyv:" — strip it for comparison
        const rawKey = key.startsWith('keyv:') ? key.slice(5) : key;
        if (rawKey.startsWith(prefix)) {
          matchedKeys.push(rawKey);
        }
      }

      if (matchedKeys.length) {
        await Promise.all(matchedKeys.map((key) => this.cache.del(key)));
        // this.logger.log(
        //   `🗑️ Cache invalidated (pattern): ${pattern} → ${matchedKeys.length} keys`,
        // );
      } else {
        // this.logger.log(
        //   `🗑️ Cache invalidate pattern matched 0 keys: ${pattern}`,
        // );
        console.log(
          'store type:',
          store?.opts?.store?.constructor?.name,
          'namespace:',
          store?._namespace,
        );
      }
    } else {
      // this.logger.warn(
      //   `Store does not support iterator() — cannot pattern-invalidate: ${pattern}`,
      // );
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      await this.cache.set('__health_check__', 'ok', 5000);
      return (await this.cache.get('__health_check__')) === 'ok';
    } catch {
      return false;
    }
  }

  async getOrSet<T>(
    key: string,
    fetchFn: () => Promise<T>,
    ttl: number = 30000,
  ): Promise<T> {
    const cached = await this.cache.get<T>(key);
    if (cached !== undefined && cached !== null) {
      // this.logger.log(`✅ Cache HIT: ${key}`);
      return cached;
    }
    // this.logger.log(`❌ Cache MISS: ${key}`);
    const fresh = await fetchFn();
    await this.cache.set(key, fresh, ttl);
    return fresh;
  }

  async invalidate(...keys: string[]): Promise<void> {
    await Promise.all(keys.map((key) => this.cache.del(key)));
    // this.logger.log(`🗑️ Cache invalidated: ${keys.join(', ')}`)
  }
}
