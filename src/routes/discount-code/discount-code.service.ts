import { Injectable } from '@nestjs/common';
import { DiscountCodeRepository } from './discount-code.repository';
import {
    CreateDiscountCodeBodyType,
    GetDiscountCodesQueryType,
    DiscountCodeType,
    UpdateDiscountCodeBodyType,
} from './discount-code.dto';

@Injectable()
export class DiscountCodeService {
    constructor(private readonly discountCodeRepository: DiscountCodeRepository) {}

    async list(query: GetDiscountCodesQueryType) {
        return this.discountCodeRepository.getList(query);
    }

    async findById(id: number): Promise<DiscountCodeType | null> {
        return this.discountCodeRepository.findById(id);
    }

    async create(data: CreateDiscountCodeBodyType, createdById: number): Promise<DiscountCodeType> {
        return this.discountCodeRepository.create(data, createdById);
    }

    async update(id: number, data: UpdateDiscountCodeBodyType): Promise<DiscountCodeType> {
        return this.discountCodeRepository.update(id, data);
    }

    async delete(id: number): Promise<DiscountCodeType> {
        return this.discountCodeRepository.delete(id);
    }
}