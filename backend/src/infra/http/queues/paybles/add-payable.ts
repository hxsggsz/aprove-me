import { QueueNames } from '@/utils/queues';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Payable } from '@/app/entities/payable';
import { AssignorNotFound } from '@/app/errors/assignor-not-found';
import { Job, Queue } from 'bull';
import { AssignorRepository } from '@/app/repositories/assignor.repository';
import { PayableRepository } from '@/app/repositories/payable.repository';
import { Input } from './add-payable.dto';
import { PayableQueue } from './queueNames';
import { BatchRepository } from '@/app/repositories/batch.repository';
import { InvalidPayable } from '@/app/errors/invalid-payable';

@Processor(QueueNames.PAYABLES)
export class AddPayable {
  constructor(
    private batchRepository: BatchRepository,
    private payableRepository: PayableRepository,
    private assignorRepository: AssignorRepository,

    @InjectQueue(QueueNames.PAYABLES)
    private queue: Queue,
  ) {}

  @Process(PayableQueue.ADD_PAYABLE)
  async process(job: Job<Input>): Promise<void> {
    const { data } = job;

    let status: 'SUCCESS' | 'FAILED';

    console.log('Processing job:', job.id, 'with data:', job.data);
    const findAssignor = await this.assignorRepository.findById(
      data.assignorId,
    );

    if (!findAssignor) throw new AssignorNotFound();

    try {
      const newPayable = new Payable(data);

      const invalidPayable = newPayable.props.value <= 1000;

      if (invalidPayable) {
        throw new InvalidPayable();
      }

      await this.payableRepository.create(newPayable);

      status = 'SUCCESS';
    } catch (error) {
      status = 'FAILED';
    }

    console.log(`Processed job: ${job.id}`);

    const batch = await this.batchRepository.incrementCompleted(
      data.batchId,
      status,
    );

    if (batch.props.completedJobs === batch.props.totalJobs) {
      await this.queue.add(PayableQueue.SEND_NOTIFICATION, {
        batchId: batch._id,
      });
    }
  }
}
