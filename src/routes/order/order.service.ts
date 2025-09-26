import { Injectable } from '@nestjs/common';
import { OrderRepo } from 'src/shared/repositories/order.repo';
import { CreateOrderBodyType, GetOrderListQueryType } from './order.dto';

@Injectable()
export class OrderService {
    constructor(private readonly orderRepo: OrderRepo) {}

    async list(userId: number, query: GetOrderListQueryType) {
        return this.orderRepo.list(userId, query);
    }
    async create(userId: number, body: CreateOrderBodyType) {
        return this.orderRepo.create(userId, body);
    }
    cancel(userId: number, orderId: number) {
        return this.orderRepo.cancel(userId, orderId);
    }

    detail(userId: number, orderId: number) {
        return this.orderRepo.detail(userId, orderId);
    }
}
