import { PartialType } from '@nestjs/mapped-types';
import { CreateExpenseTransactionDto } from './create-expense-transaction.dto';

export class UpdateExpenseTransactionDto extends PartialType(CreateExpenseTransactionDto) {}
