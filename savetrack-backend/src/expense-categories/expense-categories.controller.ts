import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { ExpenseCategoriesService } from './expense-categories.service';
import { CreateExpenseCategoryDto } from './dto/create-expense-category.dto';
import { UpdateExpenseCategoryDto } from './dto/update-expense-category.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('expense-categories')
@UseGuards(AuthGuard('jwt'))
export class ExpenseCategoriesController {
  constructor(private readonly expenseCategoriesService: ExpenseCategoriesService) { }

  // Crear una nueva categoría de gastos
  @Post()
  create(@Request() req, @Body() createDto: CreateExpenseCategoryDto) {
    return this.expenseCategoriesService.create(req.user.id, createDto);
  }

  // Obtener todas las categorías de gastos del usuario
  @Get()
  findAll(@Request() req) {
    return this.expenseCategoriesService.findAll(req.user.id);
  }

  // Obtener una categoría de gastos por ID
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.expenseCategoriesService.findOne(id, req.user.id);
  }

  // Actualizar una categoría de gastos
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateExpenseCategoryDto) {
    return this.expenseCategoriesService.update(id, req.user.id, updateDto);
  }

  // Eliminar una categoría de gastos
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.expenseCategoriesService.remove(id, req.user.id);
  }
}