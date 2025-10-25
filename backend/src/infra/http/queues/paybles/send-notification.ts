import { QueueNames } from '@/utils/queues';
import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { PayableQueue } from './queueNames';
import { BatchRepository } from '@/app/repositories/batch.repository';
import { BatchNotFound } from '@/app/errors/batch-not-found';
import { UserRepository } from '@/app/repositories/user.repository';
import { UserNotFound } from '@/app/errors/user-not-found';
import { MailerAdapter } from '@/app/adapters/email.adapter';

@Processor(QueueNames.PAYABLES)
export class SendNotification {
  constructor(
    private mailerAdapter: MailerAdapter,
    private userRepository: UserRepository,
    private batchRepository: BatchRepository,
  ) {}

  @Process(PayableQueue.SEND_NOTIFICATION)
  async process(job: Job<Record<'batchId', string>>): Promise<void> {
    console.log(
      'sending notification for job:',
      job.id,
      'with data:',
      job.data,
    );

    const findBatch = await this.batchRepository.findById(job.data.batchId);

    if (!findBatch) throw new BatchNotFound();

    const findUser = await this.userRepository.findById(findBatch.props.userId);

    if (!findUser) throw new UserNotFound();

    const total = findBatch.props.totalJobs;
    const success = findBatch.props.successJobs;
    const fails = findBatch.props.failedJobs;

    try {
      await this.mailerAdapter.send({
        from: process.env.EMAIL_USER,
        to: findUser.props.login,
        subject: 'Relatório de Processamento de recebíveis',
        styles: `
      body {
        font-family: Arial, sans-serif;
        background: #f7f8fa;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background: #fff;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        overflow: hidden;
      }
      .header {
        background: #0061ff;
        color: #fff;
        padding: 24px 32px;
        text-align: center;
      }
      .header h2 {
        margin: 0 0 8px 0;
        font-size: 25px;
      }
      .body {
        padding: 32px;
      }
      .summary-table {
        width: 100%;
        margin: 16px 0;
        border-collapse: collapse;
      }
      .summary-table th, .summary-table td {
        padding: 12px;
        text-align: center;
        border-bottom: 1px solid #f3f3f3;
      }
      .success {
        color: #27ae60;
        font-weight: bold;
      }
      .fail {
        color: #e53935;
        font-weight: bold;
      }
      .total {
        color: #222;
        font-weight: bold;
      }
      .footer {
        background: #f6f8f9;
        text-align: center;
        padding: 16px 8px;
        color: #888;
        font-size: 13px;
      }
        `,
        html: `
        <div class="container">
          <div class="header">
            <h2>Relatório de Processamento</h2>
            <p>Resumo dos seus recebíveis processados</p>
          </div>

          <div class="body">
            <p>Olá! O processamento dos recebíveis foi concluído. Veja abaixo o resumo:
            </p>

            <table class="summary-table">
              <tr>
                <th>Total Processados</th>
                <th>Com Sucesso</th>
                <th>Com Falha</th>
              </tr>
              <tr>
                <td class="total">${total}</td>
                <td class="success">${success}</td>
                <td class="fail">${fails}</td>
              </tr>
            </table>

            <p style="margin-top:28px">
              Caso deseje detalhes ou suporte, entre em contato com nossa equipe.<br />
              Obrigado por usar nossos serviços!
            </p>
          </div>

          <div class="footer">
            &copy; ${new Date().getFullYear()} Hxsggsz Inc. Todos os direitos reservados.
          </div>
        </div>`,
      });
    } catch (error) {
      console.error('Error sending email:', error);
    }
  }
}
