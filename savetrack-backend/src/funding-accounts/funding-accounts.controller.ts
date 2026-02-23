import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FundingAccountsService } from './funding-accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';
import { TransferDto } from './dto/transfer.dto';

@Controller('funding-accounts')
@UseGuards(AuthGuard('jwt'))
export class FundingAccountsController {
    constructor(private readonly accountsService: FundingAccountsService) { }

    // Obtener todas las cuentas de ahorro del usuario
    @Get()
    findAll(@Request() req) {
        return this.accountsService.findAll(req.user.id);
    }

    // Crear una cuenta de ahorro
    @Post()
    create(@Request() req, @Body() dto: CreateAccountDto) {
        return this.accountsService.create(req.user.id, dto);
    }

    // transferencia entre cuentas
    @Post('transfer')
    transfer(@Body() dto: TransferDto) {
        return this.accountsService.transferBetweenAccounts(dto);
    }

    // Actualizar una cuenta de ahorro
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updates: Partial<CreateAccountDto>) {
        return this.accountsService.update(id, req.user.id, updates);
    }

    // Eliminar una cuenta de ahorro
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        return this.accountsService.delete(id, req.user.id);
    }

    // Obtener transacciones de una cuenta específica
    @Get(':id/transactions')
    findTransactions(@Param('id') id: string) {
        return this.accountsService.findByAccount(id);
    }
}