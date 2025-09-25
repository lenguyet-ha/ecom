import { Module } from '@nestjs/common';
import { ProductController } from 'src/routes/product/product.controller';
import { ProductService } from 'src/routes/product/product.service';
import { ManageProductService } from './product-manage.service';
import { ManageProductController } from './product-manage.controller';

@Module({
    providers: [ProductService, ManageProductService],
    controllers: [ProductController, ManageProductController],
})
export class ProductModule {}
