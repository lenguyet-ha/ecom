import { Injectable } from '@nestjs/common';
import { OrderRepo } from 'src/shared/repositories/order.repo';
import { OrderProducer } from './order.producer';
import { CreateOrderBodyType, GetOrderListQueryType } from './order.dto';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepo: OrderRepo,
        private readonly orderProducer: OrderProducer,
    ) {}

    async list(userId: number, query: GetOrderListQueryType) {
        return this.orderRepo.list(userId, query);
    }
    async create(userId: number, body: CreateOrderBodyType) {
        const result = await this.orderRepo.create(userId, body);
        await this.orderProducer.addCancelPaymentJob(result.paymentId);
        return {
            data: result.orders,
        };
    }
    cancel(userId: number, orderId: number) {
        return this.orderRepo.cancel(userId, orderId);
    }

    detail(userId: number, orderId: number) {
        return this.orderRepo.detail(userId, orderId);
    }
}
