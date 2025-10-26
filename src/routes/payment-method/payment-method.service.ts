import { Injectable } from '@nestjs/common';
import { PaymentMethodRepository } from './payment-method.repository';
import {
    CreatePaymentMethodBodyType,
    GetPaymentMethodsQueryType,
    PaymentMethodType,
    UpdatePaymentMethodBodyType,
} from './payment-method.dto';

@Injectable()
export class PaymentMethodService {
    constructor(private readonly paymentMethodRepository: PaymentMethodRepository) {}

    async list(query: GetPaymentMethodsQueryType) {
        return this.paymentMethodRepository.getList(query);
    }

    async findById(id: number): Promise<PaymentMethodType | null> {
        return this.paymentMethodRepository.findById(id);
    }

    async create(data: CreatePaymentMethodBodyType): Promise<PaymentMethodType> {
        return this.paymentMethodRepository.create(data);
    }

    async update(id: number, data: UpdatePaymentMethodBodyType): Promise<PaymentMethodType> {
        return this.paymentMethodRepository.update(id, data);
    }

    async delete(id: number): Promise<PaymentMethodType> {
        return this.paymentMethodRepository.delete(id);
    }
}