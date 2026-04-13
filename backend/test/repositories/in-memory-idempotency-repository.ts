import {
  CachedResponse,
  IdempotencyRepository,
} from '@/app/repositories/idempotency.repository';

export class InMemoryIdempotencyRepository implements IdempotencyRepository {
  public store: Map<string, CachedResponse> = new Map();

  async get(key: string): Promise<CachedResponse | null> {
    return this.store.get(key) ?? null;
  }

  async save(
    key: string,
    data: CachedResponse,
    _ttlSeconds: number,
  ): Promise<void> {
    this.store.set(key, data);
  }
}
