import { Module } from '@nestjs/common';
import { BrandTranslationController } from 'src/routes/brand-translation/brand-translation.controller';
import { BrandTranslationService } from 'src/routes/brand-translation/brand-translation.service';

@Module({
    providers: [BrandTranslationService],
    controllers: [BrandTranslationController],
})
export class BrandTranslationModule {}
