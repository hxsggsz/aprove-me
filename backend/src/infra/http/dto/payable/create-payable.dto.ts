import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNumber,
  IsUUID,
  ValidateNested,
} from 'class-validator';

export class CreatePayableDTO {
  @IsNumber()
  value: number;

  @IsUUID()
  assignorId: string;

  @IsDateString()
  emissionDate: Date;
}

export class BatchCreatePayableDTO {
  @IsArray()
  @ValidateNested({ each: true })
  @ArrayMinSize(1)
  @ArrayMaxSize(10_000)
  @Type(() => CreatePayableDTO)
  payables: CreatePayableDTO[];
}
