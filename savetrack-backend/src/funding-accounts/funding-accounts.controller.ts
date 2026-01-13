import { Controller, Get, Post, Body, Param, Patch, Delete, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FundingAccountsService } from './funding-accounts.service';
import { CreateAccountDto } from './dto/create-account.dto';

@Controller('funding-accounts')
@UseGuards(AuthGuard('jwt'))
export class FundingAccountsController {
    constructor(private readonly accountsService: FundingAccountsService) { }

    @Post()
    create(@Request() req, @Body() dto: CreateAccountDto) {
        const userId = req.user.id;
        return this.accountsService.create(userId, dto);
    }

    @Get()
    findAll(@Request() req) {
        const userId = req.user.id;
        return this.accountsService.findAll(userId);
    }

    @Patch(':id')
    update(@Request() req, @Param('id') id: string, @Body() updates: Partial<CreateAccountDto>) {
        const userId = req.user.id;
        return this.accountsService.update(id, userId, updates);
    }

    @Delete(':id')
    remove(@Request() req, @Param('id') id: string) {
        const userId = req.user.id;
        return this.accountsService.delete(id, userId);
    }
}
