import { Module } from '@nestjs/common';
import { CategoryTranslationController } from 'src/routes/category-translation/category-translation.controller';
import { CategoryTranslationService } from 'src/routes/category-translation/category-translation.service';

@Module({
    providers: [CategoryTranslationService],
    controllers: [CategoryTranslationController],
})
export class CategoryTranslationModule {}
