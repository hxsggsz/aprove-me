import { Injectable } from '@nestjs/common';
import {
  MailerAdapterProps,
  MailerAdapterRepository,
} from '../repositories/email-adapter.repository';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailerAdapter implements MailerAdapterRepository {
  constructor(private readonly mailerService: MailerService) {}

  async send(email: MailerAdapterProps): Promise<void> {
    await this.mailerService.sendMail({
      ...email,
      html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <style>
          ${email.styles}
          </style>
        </head>
        <body>
        ${email.html}
        </body
      </html>
      `,
    });
  }
}
