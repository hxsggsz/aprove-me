export interface MailerAdapterProps {
  from: string;
  to: string;
  subject: string;
  html: string;
  styles: string;
}

export abstract class MailerAdapterRepository {
  abstract send(email: MailerAdapterProps): Promise<void>;
}
