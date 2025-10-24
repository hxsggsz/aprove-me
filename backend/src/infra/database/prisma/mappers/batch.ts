import { Batch } from '@/app/entities/batch';
import { Batch as RawBatch } from '@prisma/client';

export class PrismaBatchMapper {
  static toDomain(raw: RawBatch) {
    return new Batch(raw, raw.id);
  }

  static toPrisma(batch: Batch) {
    return {
      id: batch._id,
      userId: batch.props.userId,
      totalJobs: batch.props.totalJobs,
      completedJobs: batch.props.completedJobs,
      successJobs: batch.props.successJobs,
      failedJobs: batch.props.failedJobs,
      status: batch.props.status,
      createdAt: batch.props.createdAt,
      updatedAt: batch.props.updatedAt,
    };
  }
}
