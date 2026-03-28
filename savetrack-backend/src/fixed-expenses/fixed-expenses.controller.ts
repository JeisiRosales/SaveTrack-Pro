import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, Request } from '@nestjs/common';
import { FixedExpensesService } from './fixed-expenses.service';
import { CreateFixedExpenseDto } from './dto/create-fixed-expense.dto';
import { UpdateFixedExpenseDto } from './dto/update-fixed-expense.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('fixed-expenses')
@UseGuards(AuthGuard('jwt'))
export class FixedExpensesController {
  constructor(private readonly fixedExpensesService: FixedExpensesService) { }

  @Post()
  create(@Request() req, @Body() createDto: CreateFixedExpenseDto) {
    return this.fixedExpensesService.create(req.user.id, createDto);
  }

  @Get()
  findAll(@Request() req) {
    return this.fixedExpensesService.findAll(req.user.id);
  }

  @Get('summary')
  getSummary(@Request() req) {
    return this.fixedExpensesService.getSummary(req.user.id);
  }

  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateFixedExpenseDto) {
    return this.fixedExpensesService.update(id, req.user.id, updateDto);
  }

  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.fixedExpensesService.remove(id, req.user.id);
  }
}
