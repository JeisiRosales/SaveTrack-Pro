import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { IncomeCategoriesService } from './income-categories.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('income-categories')
@UseGuards(AuthGuard('jwt'))
export class IncomeCategoriesController {
  constructor(private readonly incomeCategoriesService: IncomeCategoriesService) { }

  // Crear categoría de ingresos
  @Post()
  create(@Request() req, @Body() createDto: CreateIncomeCategoryDto) {
    return this.incomeCategoriesService.create(req.user.sub, createDto);
  }

  // Crear múltiples categorías de ingresos
  @Post('bulk')
  createMany(@Request() req, @Body() createDtos: CreateIncomeCategoryDto[]) {
    return this.incomeCategoriesService.createMany(req.user.sub, createDtos);
  }

  // Buscar todas las categorías de ingresos
  @Get()
  findAll(@Request() req) {
    return this.incomeCategoriesService.findAll(req.user.sub);
  }

  // Buscar una categoría de ingresos
  @Get(':id')
  findOne(@Request() req, @Param('id') id: string) {
    return this.incomeCategoriesService.findOne(id, req.user.sub);
  }

  // Actualizar categoría de ingresos
  @Patch(':id')
  update(@Request() req, @Param('id') id: string, @Body() updateDto: UpdateIncomeCategoryDto) {
    return this.incomeCategoriesService.update(id, req.user.sub, updateDto);
  }

  // Eliminar categoría de ingresos
  @Delete(':id')
  remove(@Request() req, @Param('id') id: string) {
    return this.incomeCategoriesService.remove(id, req.user.sub);
  }
}