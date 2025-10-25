import { Module } from '@nestjs/common';
import { BcryptAdapterRepository } from '@/app/repositories/bcrypt-adapter-repository';
import { BcryptAdapter } from '@/app/adapters/bcrypt-adapter';
import { JwtAdapter } from '@/app/adapters/jwt.adapter';
import { JwtAdapterRepository } from '@/app/repositories/jwt-adapter.repository';
import { JwtService } from '@nestjs/jwt';
import { MailerAdapter } from './email.adapter';
import { MailerAdapterRepository } from '../repositories/email-adapter.repository';

@Module({
  providers: [
    {
      provide: BcryptAdapterRepository,
      useClass: BcryptAdapter,
    },
    {
      provide: JwtAdapterRepository,
      useClass: JwtAdapter,
    },
    {
      provide: MailerAdapterRepository,
      useClass: MailerAdapter,
    },
    MailerAdapter,
    JwtService,
  ],
  exports: [
    BcryptAdapterRepository,
    JwtAdapterRepository,
    MailerAdapterRepository,
    MailerAdapter,
  ],
})
export class AdaptersModule {}
