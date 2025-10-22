import { QueueNames } from '@/utils/queues';
import { InjectQueue, Process, Processor } from '@nestjs/bull';
import { Payable } from '@/app/entities/payable';
import { AssignorNotFound } from '@/app/errors/assignor-not-found';
import { Job, Queue } from 'bull';
import { AssignorRepository } from '@/app/repositories/assignor.repository';
import { PayableRepository } from '@/app/repositories/payable.repository';
import { Input } from './add-payable.dto';
import { PayableQueue } from './queueNames';

@Processor(QueueNames.PAYABLES)
export class AddPayable {
  constructor(
    private payableRepository: PayableRepository,
    private assignorRepository: AssignorRepository,

    @InjectQueue(QueueNames.PAYABLES)
    private queue: Queue,
  ) {}

  @Process(PayableQueue.ADD_PAYABLE)
  async process(job: Job<Input>): Promise<void> {
    const { data } = job;

    console.log('Processing job:', job.id, 'with data:', job.data);
    const findAssignor = await this.assignorRepository.findById(
      data.assignorId,
    );

    if (!findAssignor) throw new AssignorNotFound();

    const newPayable = new Payable(data);
    await this.payableRepository.create(newPayable);

    console.log(`Processed job: ${job.id} - sending notification...`);

    await this.queue.add(PayableQueue.SEND_NOTIFICATION, {
      assignorId: data.assignorId,
    });
  }
}
