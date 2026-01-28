import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FundingAccountsService } from './funding-accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('funding-accounts')
@UseGuards(AuthGuard('jwt'))
export class FundingAccountsController {
    constructor(private readonly accountsService: FundingAccountsService) { }

    // Crear una cuenta de ahorro
    @Post()
    create(@Request() req, @Body() dto: CreateAccountDto) {
        const userId = req.user.id;
        return this.accountsService.create(userId, dto);
    }

    // Obtener todas las cuentas de ahorro del usuario
    @Get()
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.accountsService.findAll(userId);
    }

    // Actualizar una cuenta de ahorro
    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updates: Partial<CreateAccountDto>) {
        const userId = req.user.id;
        return this.accountsService.update(id, userId, updates);
    }

    // Eliminar una cuenta de ahorro
    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        const userId = req.user.id;
        return this.accountsService.delete(id, userId);
    }
}
