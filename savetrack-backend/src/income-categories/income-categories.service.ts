import { Injectable } from '@nestjs/common';
import { CreateIncomeCategoryDto } from './dto/create-income-category.dto';
import { UpdateIncomeCategoryDto } from './dto/update-income-category.dto';

@Injectable()
export class IncomeCategoriesService {
  create(createIncomeCategoryDto: CreateIncomeCategoryDto) {
    return 'This action adds a new incomeCategory';
  }

  findAll() {
    return `This action returns all incomeCategories`;
  }

  findOne(id: number) {
    return `This action returns a #${id} incomeCategory`;
  }

  update(id: number, updateIncomeCategoryDto: UpdateIncomeCategoryDto) {
    return `This action updates a #${id} incomeCategory`;
  }

  remove(id: number) {
    return `This action removes a #${id} incomeCategory`;
  }
}
