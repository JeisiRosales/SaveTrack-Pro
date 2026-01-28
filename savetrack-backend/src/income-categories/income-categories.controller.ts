import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IncomeCategoriesService } from './income-categories.service';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';

@Controller('income-categories')
export class IncomeCategoriesController {
  constructor(private readonly incomeCategoriesService: IncomeCategoriesService) {}

  @Post()
  create(@Body() createIncomeCategoryDto: CreateIncomeCategoryDto) {
    return this.incomeCategoriesService.create(createIncomeCategoryDto);
  }

  @Get()
  findAll() {
    return this.incomeCategoriesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.incomeCategoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIncomeCategoryDto: UpdateIncomeCategoryDto) {
    return this.incomeCategoriesService.update(+id, updateIncomeCategoryDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.incomeCategoriesService.remove(+id);
  }
}
