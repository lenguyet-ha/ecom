import { Controller, Get, Param, Query } from '@nestjs/common';

import { GetProductParamsDTO, GetProductsQueryDTO } from 'src/routes/product/product.dto';
import { ProductService } from 'src/routes/product/product.service';
import { IsPublic } from 'src/shared/decorators/public.decorator';

@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @Get()
    @IsPublic()
    list(@Query() query: GetProductsQueryDTO) {
        return this.productService.list(query);
    }

    @Get(':productId')
    @IsPublic()
    findById(@Param() params: GetProductParamsDTO) {
        return this.productService.findById(params.productId);
    }
}
