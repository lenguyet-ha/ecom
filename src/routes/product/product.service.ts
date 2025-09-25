import { Injectable } from '@nestjs/common';

import { isNotFoundPrismaError } from 'src/shared/helpers';
import { ProductRepository } from 'src/shared/repositories/product.repository';
import { NotFoundRecordException } from 'src/shared/types/error';
import { CreateProductBodyType, GetProductsQueryType, UpdateProductBodyType } from './product.dto';

@Injectable()
export class ProductService {
    constructor(private productRepo: ProductRepository) {}

    async list(query: GetProductsQueryType) {
        const data = await this.productRepo.getList(query);
        return data;
    }

    async findById(id: number) {
        const product = await this.productRepo.findById(id);
        if (!product) {
            throw NotFoundRecordException;
        }
        return product;
    }
}
