import { Module } from '@nestjs/common';
import { BrandController } from 'src/routes/brand/brand.controller';
import { BrandService } from 'src/routes/brand/brand.service';

@Module({
    providers: [BrandService],
    controllers: [BrandController],
})
export class BrandModule {}
