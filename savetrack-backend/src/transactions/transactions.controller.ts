// =============================================
// Controlador de Transacciones
// Ubicación: src/transactions/transactions.controller.ts
// =============================================
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    @Post()
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionsService.create(dto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.transactionsService.findAllByUser(userId);
    }

    @Get('goal/:goalId')
    findByGoal(@Param('goalId') goalId: string) {
        return this.transactionsService.findByGoal(goalId);
    }

    @Get('account/:accountId')
    @UseGuards(AuthGuard('jwt'))
    findByAccount(@Param('accountId') accountId: string) {
        return this.transactionsService.findByAccount(accountId);
    }
}
