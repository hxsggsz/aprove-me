import { PayableQueue } from '@/infra/http/queues/paybles/queueNames';
import { QueueNames } from '@/utils/queues';
import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import { Queue } from 'bull';

export interface Input {
  value: number;
  emissionDate: Date;
  assignorId: string;
}

@Injectable()
export class BatchAddNewPayable {
  constructor(
    @InjectQueue(QueueNames.PAYABLES)
    private readonly queue: Queue,
  ) {}

  async execute(input: Input[]): Promise<undefined> {
    const jobs = input.map((payable, index) => ({
      name: PayableQueue.ADD_PAYABLE,
      data: payable,
      opts: { jobId: `payable-${index}-${Date.now()}` },
    }));

    await this.queue.addBulk(jobs);
  }
}
