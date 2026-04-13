export interface CachedResponse {
  response: object;
  statusCode: number;
}

export abstract class IdempotencyRepository {
  abstract get(key: string): Promise<CachedResponse | null>;
  abstract save(
    key: string,
    data: CachedResponse,
    ttlSeconds: number,
  ): Promise<void>;
}
