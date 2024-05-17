import { Body, Controller, Post } from '@nestjs/common';
import { CreatePayableDTO } from '@/infra/http/dto/create-payable.dto';
import { AddNewPayable } from '@/app/use-cases/add-new-payable';

@Controller('payable')
export class PayableController {
  constructor(private addNewPayable: AddNewPayable) {}

  @Post()
  async create(@Body() body: CreatePayableDTO) {
    const { newPayable } = await this.addNewPayable.execute(body);
    return newPayable;
  }
}