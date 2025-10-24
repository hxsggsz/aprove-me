import { Batch } from '../entities/batch';

export abstract class BatchRepository {
  public abstract create(batch: Batch): Promise<Batch>;
  public abstract incrementCompleted(
    batchId: string,
    status: 'SUCCESS' | 'FAILED',
  ): Promise<Batch>;
}
