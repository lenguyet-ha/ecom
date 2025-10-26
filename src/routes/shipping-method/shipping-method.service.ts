import { Injectable } from '@nestjs/common';
import { ShippingMethodRepository } from './shipping-method.repository';
import {
    CreateShippingMethodBodyType,
    GetShippingMethodsQueryType,
    ShippingMethodType,
    UpdateShippingMethodBodyType,
} from './shipping-method.dto';

@Injectable()
export class ShippingMethodService {
    constructor(private readonly shippingMethodRepository: ShippingMethodRepository) {}

    async list(query: GetShippingMethodsQueryType) {
        return this.shippingMethodRepository.getList(query);
    }

    async findById(id: number): Promise<ShippingMethodType | null> {
        return this.shippingMethodRepository.findById(id);
    }

    async create(data: CreateShippingMethodBodyType): Promise<ShippingMethodType> {
        return this.shippingMethodRepository.create(data);
    }

    async update(id: number, data: UpdateShippingMethodBodyType): Promise<ShippingMethodType> {
        return this.shippingMethodRepository.update(id, data);
    }

    async delete(id: number): Promise<ShippingMethodType> {
        return this.shippingMethodRepository.delete(id);
    }
}