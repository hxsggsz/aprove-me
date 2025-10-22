import { QueueNames } from '@/utils/queues';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PayableQueue } from './queueNames';
import { MailerService } from '@nestjs-modules/mailer';
import { AssignorNotFound } from '@/app/errors/assignor-not-found';
import { AssignorRepository } from '@/app/repositories/assignor.repository';

@Processor(QueueNames.PAYABLES)
export class SendNotification {
  constructor(
    private assignorRepository: AssignorRepository,
    private mailerService: MailerService,
  ) {}

  @Process(PayableQueue.SEND_NOTIFICATION)
  async process(job: Job<Record<'assignorId', string>>): Promise<void> {
    console.log(
      'sending notification for job:',
      job.id,
      'with data:',
      job.data,
    );

    const findAssignor = await this.assignorRepository.findById(
      job.data.assignorId,
    );

    if (!findAssignor) throw new AssignorNotFound();

    try {
      await this.mailerService.sendMail({
        from: process.env.EMAIL_USER,
        to: findAssignor.props.email,
        subject: 'Enviando Email com NestJS',
        html: `<h3 style="color: red">teste</h3>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
