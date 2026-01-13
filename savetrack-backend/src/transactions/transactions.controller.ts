// =============================================
// Controlador de Transacciones
// Ubicación: src/transactions/transactions.controller.ts
// =============================================
import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionsService.create(dto);
    }

    @Get('goal/:goalId')
    findByGoal(@Param('goalId') goalId: string) {
        return this.transactionsService.findByGoal(goalId);
    }
}
