import { IdempotencyService } from './idempotency-service';
import { InMemoryIdempotencyRepository } from 'test/repositories/in-memory-idempotency-repository';
import { CachedResponse } from '@/app/repositories/idempotency.repository';

const makeSut = () => {
  const idempotencyRepository = new InMemoryIdempotencyRepository();
  const sutCase = new IdempotencyService(idempotencyRepository);

  return { idempotencyRepository, sutCase };
};

describe('IdempotencyService', () => {
  describe('generateKey', () => {
    it('generates a deterministic key from userId, operation, and payload', () => {
      const { sutCase } = makeSut();

      const payload = { value: 100, emissionDate: '2026-01-01', assignorId: 'abc-123' };
      const key1 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', payload);
      const key2 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', payload);

      expect(key1).toBe(key2);
      expect(key1).toContain('idempotency:user-1:CREATE_PAYABLE:');
    });

    it('generates different keys for different payloads', () => {
      const { sutCase } = makeSut();

      const key1 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', { value: 100, emissionDate: '2026-01-01', assignorId: 'abc-123' });
      const key2 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', { value: 200, emissionDate: '2026-01-01', assignorId: 'abc-123' });

      expect(key1).not.toBe(key2);
    });

    it('generates the same key regardless of payload key order', () => {
      const { sutCase } = makeSut();

      const key1 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', { value: 100, assignorId: 'abc-123', emissionDate: '2026-01-01' });
      const key2 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', { emissionDate: '2026-01-01', value: 100, assignorId: 'abc-123' });

      expect(key1).toBe(key2);
    });

    it('generates different keys for different users', () => {
      const { sutCase } = makeSut();

      const payload = { value: 100, emissionDate: '2026-01-01', assignorId: 'abc-123' };
      const key1 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', payload);
      const key2 = sutCase.generateKey('user-2', 'CREATE_PAYABLE', payload);

      expect(key1).not.toBe(key2);
    });

    it('generates different keys for different operations', () => {
      const { sutCase } = makeSut();

      const payload = { value: 100, emissionDate: '2026-01-01', assignorId: 'abc-123' };
      const key1 = sutCase.generateKey('user-1', 'CREATE_PAYABLE', payload);
      const key2 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', payload);

      expect(key1).not.toBe(key2);
    });

    it('generates the same key for arrays with different item order', () => {
      const { sutCase } = makeSut();

      const key1 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { value: 100, assignorId: 'abc', emissionDate: '2026-01-01' },
        { value: 200, assignorId: 'def', emissionDate: '2026-02-01' },
      ]);
      const key2 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { value: 200, assignorId: 'def', emissionDate: '2026-02-01' },
        { value: 100, assignorId: 'abc', emissionDate: '2026-01-01' },
      ]);

      expect(key1).toBe(key2);
    });

    it('generates the same key for array items with different key order', () => {
      const { sutCase } = makeSut();

      const key1 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { value: 100, assignorId: 'abc', emissionDate: '2026-01-01' },
      ]);
      const key2 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { emissionDate: '2026-01-01', value: 100, assignorId: 'abc' },
      ]);

      expect(key1).toBe(key2);
    });

    it('generates different keys for arrays with different items', () => {
      const { sutCase } = makeSut();

      const key1 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { value: 100, assignorId: 'abc', emissionDate: '2026-01-01' },
      ]);
      const key2 = sutCase.generateKey('user-1', 'CREATE_BATCH_PAYABLE', [
        { value: 999, assignorId: 'abc', emissionDate: '2026-01-01' },
      ]);

      expect(key1).not.toBe(key2);
    });
  });

  describe('check', () => {
    it('returns null when key does not exist', async () => {
      const { sutCase } = makeSut();

      const result = await sutCase.check('nonexistent-key');

      expect(result).toBeNull();
    });

    it('returns the cached response when key exists', async () => {
      const { sutCase, idempotencyRepository } = makeSut();

      const cachedData: CachedResponse = {
        response: { id: 'payable-1', value: 100 },
        statusCode: 201,
      };
      idempotencyRepository.store.set('existing-key', cachedData);

      const result = await sutCase.check('existing-key');

      expect(result).toEqual(cachedData);
    });
  });

  describe('save', () => {
    it('stores the response in the repository', async () => {
      const { sutCase, idempotencyRepository } = makeSut();

      const data: CachedResponse = {
        response: { id: 'payable-1', value: 100 },
        statusCode: 201,
      };

      await sutCase.save('my-key', data, 3600);

      const stored = idempotencyRepository.store.get('my-key');
      expect(stored).toEqual(data);
    });

    it('can be retrieved after saving', async () => {
      const { sutCase } = makeSut();

      const data: CachedResponse = {
        response: { id: 'payable-1', value: 100 },
        statusCode: 201,
      };

      await sutCase.save('my-key', data, 3600);
      const result = await sutCase.check('my-key');

      expect(result).toEqual(data);
    });
  });
});
