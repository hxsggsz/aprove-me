import { createHash } from 'crypto';
import { Injectable } from '@nestjs/common';
import {
  CachedResponse,
  IdempotencyRepository,
} from '@/app/repositories/idempotency.repository';

@Injectable()
export class IdempotencyService {
  constructor(private readonly idempotencyRepository: IdempotencyRepository) {}

  generateKey(userId: string, operation: string, payload: object): string {
    const canonical = this.canonicalize(payload);
    const hash = createHash('sha256').update(canonical).digest('hex');

    return `idempotency:${userId}:${operation}:${hash}`;
  }

  private canonicalize(value: unknown): string {
    if (Array.isArray(value)) {
      const items = value.map((item) => this.canonicalize(item));
      items.sort();
      return `[${items.join(',')}]`;
    }

    if (value !== null && typeof value === 'object') {
      const keys = Object.keys(value).sort();
      const entries = keys.map(
        (key) => `${JSON.stringify(key)}:${this.canonicalize(value[key])}`,
      );
      return `{${entries.join(',')}}`;
    }

    return JSON.stringify(value);
  }

  async check(key: string): Promise<CachedResponse | null> {
    return this.idempotencyRepository.get(key);
  }

  async save(
    key: string,
    data: CachedResponse,
    ttlSeconds: number,
  ): Promise<void> {
    await this.idempotencyRepository.save(key, data, ttlSeconds);
  }
}
