import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import {
  BatchCreatePayableDTO,
  CreatePayableDTO,
} from '@/infra/http/dto/payable/create-payable.dto';
import { AddNewPayable } from '@/app/use-cases/payable/add-new-payable';
import { ParamId } from '@/utils/param-id';
import { FindPayableById } from '@/app/use-cases/payable/find-payable-by-id';
import { EditPayableDTO } from '@/infra/http/dto/payable/edit-payable.dto';
import { EditPayable } from '@/app/use-cases/payable/edit-payable';
import { DeletePayable } from '@/app/use-cases/payable/delete-payable';
import { FindAll } from '@/app/use-cases/payable/find-all';
import { FindAllDTO } from '../dto/payable/find-all.dto';
import { BatchAddNewPayable } from '@/app/use-cases/payable/batch-add-payables';
import { IdempotencyService } from '@/app/services/idempotency-service';
import {
  IdempotencyOperation,
  IDEMPOTENCY_TTL_SECONDS,
} from '@/app/constants/idempotency';

@Controller('payable')
export class PayableController {
  constructor(
    private addNewPayable: AddNewPayable,
    private batchAddNewPayable: BatchAddNewPayable,
    private findPayableById: FindPayableById,
    private findAll: FindAll,
    private editPayable: EditPayable,
    private deletePayable: DeletePayable,
    private idempotencyService: IdempotencyService,
  ) {}

  @Post()
  async create(@Req() request: Request, @Body() body: CreatePayableDTO) {
    const userId = request['user']['sub'];

    const idempotencyKey = this.idempotencyService.generateKey(
      userId,
      IdempotencyOperation.CREATE_PAYABLE,
      {
        assignorId: body.assignorId,
        emissionDate: body.emissionDate,
        value: body.value,
      },
    );

    const cached = await this.idempotencyService.check(idempotencyKey);
    if (cached) {
      return cached.response;
    }

    const { newPayable } = await this.addNewPayable.execute(body);

    await this.idempotencyService.save(
      idempotencyKey,
      { response: newPayable as unknown as object, statusCode: 201 },
      IDEMPOTENCY_TTL_SECONDS,
    );

    return newPayable;
  }

  @Post('batch')
  async batchCreate(
    @Req() request: Request,
    @Body() body: BatchCreatePayableDTO,
  ) {
    const userId = request['user']['sub'];

    const batchPayload = body.payables.map((p) => ({
      assignorId: p.assignorId,
      emissionDate: p.emissionDate,
      value: p.value,
    }));

    const idempotencyKey = this.idempotencyService.generateKey(
      userId,
      IdempotencyOperation.CREATE_BATCH_PAYABLE,
      batchPayload,
    );

    const cached = await this.idempotencyService.check(idempotencyKey);
    if (cached) {
      return cached.response;
    }

    await this.batchAddNewPayable.execute({ userId, payables: body.payables });

    await this.idempotencyService.save(
      idempotencyKey,
      { response: { message: 'batch processing started' }, statusCode: 200 },
      IDEMPOTENCY_TTL_SECONDS,
    );
  }

  @Get()
  async findAllPayables(@Query() query: FindAllDTO) {
    const { payables, totalPages, totalPayables } = await this.findAll.execute({
      skip: Number(query.skip),
      take: Number(query.take),
    });

    return { payables, totalPages, totalPayables };
  }

  @Get(':payableId')
  async findById(@ParamId('payableId') payableId: string) {
    const { payable } = await this.findPayableById.execute({ payableId });

    return payable;
  }

  @Put(':payableId')
  async edit(
    @ParamId('payableId') payableId: string,
    @Body() body: EditPayableDTO,
  ) {
    const { payable } = await this.editPayable.execute({
      ...body,
      payableId,
    });

    return payable;
  }

  @Delete(':payableId')
  async delete(@ParamId('payableId') payableId: string) {
    await this.deletePayable.execute({ payableId });
  }
}
