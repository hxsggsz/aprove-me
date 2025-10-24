import { Batch } from '@/app/entities/batch';
import { BatchRepository } from '@/app/repositories/batch.repository';
import { PayableQueue } from '@/infra/http/queues/paybles/queueNames';
import { QueueNames } from '@/utils/queues';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

export interface Payables {
  value: number;
  emissionDate: Date;
  assignorId: string;
}

export interface Input {
  userId: string;
  payables: Payables[];
}

@Injectable()
export class BatchAddNewPayable {
  constructor(
    private readonly batchRepository: BatchRepository,
    @InjectQueue(QueueNames.PAYABLES)
    private readonly queue: Queue,
  ) {}

  async execute(input: Input): Promise<undefined> {
    const newBatch = new Batch({
      userId: input.userId,
      totalJobs: input.payables.length,
      completedJobs: 0,
      successJobs: 0,
      failedJobs: 0,
      status: 'PROCESSING',
    });

    const jobs = input.payables.map((payable, index) => ({
      name: PayableQueue.ADD_PAYABLE,
      data: { ...payable, batchId: newBatch._id },
      opts: { jobId: `payable-${index}-${Date.now()}` },
    }));

    await Promise.all([
      await this.batchRepository.create(newBatch),
      await this.queue.addBulk(jobs),
    ]);
  }
}
