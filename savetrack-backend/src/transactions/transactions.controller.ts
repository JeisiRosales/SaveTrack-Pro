// =============================================
// Controlador de Transacciones
// Ubicación: src/transactions/transactions.controller.ts
// =============================================
import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('transactions')
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    // crear transaccion
    @Post()
    @UseGuards(AuthGuard('jwt'))
    create(@Body() dto: CreateTransactionDto) {
        return this.transactionsService.create(dto);
    }

    // obtener todas las transacciones de un usuario
    @Get()
    @UseGuards(AuthGuard('jwt'))
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.transactionsService.findAllByUser(userId);
    }

    // obtener todas las transacciones de un objetivo
    @Get('goal/:goalId')
    findByGoal(@Param('goalId') goalId: string) {
        return this.transactionsService.findByGoal(goalId);
    }

    // obtener todas las transacciones de una cuenta
    @Get('account/:accountId')
    @UseGuards(AuthGuard('jwt'))
    findByAccount(@Param('accountId') accountId: string) {
        return this.transactionsService.findByAccount(accountId);
    }

    // transferencia entre cuentas
    @Post('transfer')
    @UseGuards(AuthGuard('jwt'))
    transfer(@Body() dto: TransferDto) {
        // Llamamos al nuevo método específico para transferencias
        return this.transactionsService.transferBetweenAccounts(dto);
    }
}
