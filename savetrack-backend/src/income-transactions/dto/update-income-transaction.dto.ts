import { PartialType } from '@nestjs/mapped-types';
import { CreateIncomeTransactionDto } from './create-income-transaction.dto';

export class UpdateIncomeTransactionDto extends PartialType(CreateIncomeTransactionDto) { }