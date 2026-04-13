import {
  CachedResponse,
  IdempotencyRepository,
} from '@/app/repositories/idempotency.repository';
import Redis from 'ioredis';

export class RedisIdempotencyRepository implements IdempotencyRepository {
  private readonly redis: Redis;

  constructor(redisHost: string) {
    this.redis = new Redis(redisHost);
  }

  async get(key: string): Promise<CachedResponse | null> {
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    return JSON.parse(data) as CachedResponse;
  }

  async save(
    key: string,
    data: CachedResponse,
    ttlSeconds: number,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(data), 'EX', ttlSeconds);
  }
}
