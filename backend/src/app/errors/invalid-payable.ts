import { ServerError } from './server-error';

export class InvalidPayable extends ServerError {
  constructor(statusCode = 400) {
    super('invalid payable', statusCode);
  }
}
