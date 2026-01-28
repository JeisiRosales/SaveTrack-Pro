import { Injectable } from '@nestjs/common';
import { CreateIncomeTransactionDto } from './dto/create-income-transaction.dto';
import { UpdateIncomeTransactionDto } from './dto/update-income-transaction.dto';

@Injectable()
export class IncomeTransactionsService {
  create(createIncomeTransactionDto: CreateIncomeTransactionDto) {
    return 'This action adds a new incomeTransaction';
  }

  findAll() {
    return `This action returns all incomeTransactions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} incomeTransaction`;
  }

  update(id: number, updateIncomeTransactionDto: UpdateIncomeTransactionDto) {
    return `This action updates a #${id} incomeTransaction`;
  }

  remove(id: number) {
    return `This action removes a #${id} incomeTransaction`;
  }
}
