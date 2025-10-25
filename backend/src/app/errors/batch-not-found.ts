import { ServerError } from './server-error';

export class BatchNotFound extends ServerError {
  constructor(statusCode = 404) {
    super('batch not found', statusCode);
  }
}
