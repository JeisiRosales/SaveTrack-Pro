import { Module } from '@nestjs/common';
import { IncomeCategoriesService } from './income-categories.service';
import { IncomeCategoriesController } from './income-categories.controller';

@Module({
  controllers: [IncomeCategoriesController],
  providers: [IncomeCategoriesService],
})
export class IncomeCategoriesModule {}
