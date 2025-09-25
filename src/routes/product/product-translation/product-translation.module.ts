import { Module } from '@nestjs/common';
import { ProductTranslationController } from 'src/routes/product/product-translation/product-translation.controller';
import { ProductTranslationService } from 'src/routes/product/product-translation/product-translation.service';

@Module({
    providers: [ProductTranslationService],
    controllers: [ProductTranslationController],
})
export class ProductTranslationModule {}
