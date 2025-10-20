import { Injectable } from '@nestjs/common';

interface Input {
  value: number;
  emissionDate: Date;
  assignorId: string;
}

@Injectable()
export class BatchAddNewPayable {
  constructor() {}

  async execute(input: Input[]): Promise<null> {
    console.log('input', input);
    return null;
  }
}
