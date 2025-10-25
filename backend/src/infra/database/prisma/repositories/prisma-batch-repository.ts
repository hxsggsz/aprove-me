import { BatchRepository } from '@/app/repositories/batch.repository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { Batch } from '@/app/entities/batch';
import { PrismaBatchMapper } from '../mappers/batch';

@Injectable()
export class PrismaBatchRepository implements BatchRepository {
  constructor(private db: PrismaService) {}
  public async findById(batchId: string): Promise<Batch | null> {
    const findBatch = await this.db.batch.findFirst({
      where: { id: batchId },
    });

    if (!findBatch) return null;

    return PrismaBatchMapper.toDomain(findBatch);
  }

  public async create(batch: Batch): Promise<Batch> {
    const rawData = PrismaBatchMapper.toPrisma(batch);
    const newBatch = await this.db.batch.create({
      data: rawData,
    });

    return PrismaBatchMapper.toDomain(newBatch);
  }

  public async incrementCompleted(
    batchId: string,
    status: 'SUCCESS' | 'FAILED',
  ): Promise<Batch> {
    const updatedBatch = await this.db.batch.update({
      where: { id: batchId },
      data: {
        completedJobs: { increment: 1 },
        ...(status === 'SUCCESS'
          ? { successJobs: { increment: 1 } }
          : { failedJobs: { increment: 1 } }),
      },
    });

    return PrismaBatchMapper.toDomain(updatedBatch);
  }
}
