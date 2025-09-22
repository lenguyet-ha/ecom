import { Module } from '@nestjs/common';
import { CategoryController } from 'src/routes/category/category.controller';
import { CategoryService } from 'src/routes/category/category.service';

@Module({
    providers: [CategoryService],
    controllers: [CategoryController],
})
export class CategoryModule {}
