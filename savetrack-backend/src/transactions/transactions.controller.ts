import { Controller, Get, Post, Body, Param, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { TransactionsService } from './transactions.service';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Controller('transactions')
@UseGuards(AuthGuard('jwt'))
export class TransactionsController {
    constructor(private readonly transactionsService: TransactionsService) { }

    // crear transaccion
    @Post()
    create(@Request() req, @Body() dto: CreateTransactionDto) {
        return this.transactionsService.create(req.user.id, dto);
    }

    // obtener todas las transacciones de un usuario
    @Get()
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.transactionsService.findAllByUser(userId);
    }

    // obtener todas las transacciones de una meta
    @Get('goal/:goalId')
    findByGoal(@Param('goalId') goalId: string) {
        return this.transactionsService.findByGoal(goalId);
    }
}
