import { AddNewAssignor } from '@/app/use-cases/assignor/add-new-assignor';
import { DeleteAssignor } from '@/app/use-cases/assignor/delete-assignor';
import { EditAssignor } from '@/app/use-cases/assignor/edit-assignor';
import { FindAssignorById } from '@/app/use-cases/assignor/find-assignor-by-id';
import { AddNewPayable } from '@/app/use-cases/payable/add-new-payable';
import { DeletePayable } from '@/app/use-cases/payable/delete-payable';
import { EditPayable } from '@/app/use-cases/payable/edit-payable';
import { FindPayableById } from '@/app/use-cases/payable/find-payable-by-id';
import { AddNewUser } from '@/app/use-cases/user/add-new-user';
import { DatabaseModule } from '@/infra/database/database.module';
import { AssignorController } from '@/infra/http/controllers/assignor.controller';
import { PayableController } from '@/infra/http/controllers/payable.controller';
import { Module } from '@nestjs/common';
import { UserController } from './controllers/user.controller';
import { AdaptersModule } from '@/app/adapters/adapters.module';
import { LoginUser } from '@/app/use-cases/user/login-user';
import { FindAll } from '@/app/use-cases/payable/find-all';
import { FindAllAssingors } from '@/app/use-cases/assignor/find-all';
import { BatchAddNewPayable } from '@/app/use-cases/payable/batch-add-payables';
import { BullModule } from '@nestjs/bull';
import { QueueNames } from '@/utils/queues';
import { queueConsumers } from './queues';
import { MailerModule } from '@nestjs-modules/mailer';

const assignorUseCases = [
  AddNewAssignor,
  FindAllAssingors,
  FindAssignorById,
  EditAssignor,
  DeleteAssignor,
];

const payableUseCases = [
  AddNewPayable,
  BatchAddNewPayable,
  FindAll,
  FindPayableById,
  EditPayable,
  DeletePayable,
];

const userUseCases = [AddNewUser, LoginUser];

@Module({
  imports: [
    AdaptersModule,
    DatabaseModule,
    BullModule.registerQueue({ name: QueueNames.PAYABLES }),
    MailerModule.forRoot({
      transport: {
        host: 'smtp.gmail.com',
        secure: false,
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
        ignoreTLS: false,
      },
    }),
  ],
  providers: [
    ...queueConsumers,
    ...assignorUseCases,
    ...payableUseCases,
    ...userUseCases,
  ],
  controllers: [PayableController, AssignorController, UserController],
})
export class HttpModule {}
