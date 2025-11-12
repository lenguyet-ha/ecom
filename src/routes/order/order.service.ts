import { Injectable } from '@nestjs/common';
import { OrderRepo } from 'src/shared/repositories/order.repo';
import { CreateOrderBodyType, GetOrderListQueryType, UpdateOrderStatusBodyType } from './order.dto';
import type { TokenPayload } from 'src/shared/types/jwt.type';

@Injectable()
export class OrderService {
    constructor(
        private readonly orderRepo: OrderRepo,
    ) {}

    async list(user: TokenPayload, query: GetOrderListQueryType) {
        return this.orderRepo.list(user, query);
    }
    async create(userId: number, body: CreateOrderBodyType) {
        const result = await this.orderRepo.create(userId, body);
        return result;
    }
    cancel(userId: number, orderId: number) {
        return this.orderRepo.cancel(userId, orderId);
    }

    detail(user: TokenPayload, orderId: number) {
        return this.orderRepo.detail(user, orderId);
    }

    updateStatus(orderId: number, body: UpdateOrderStatusBodyType, userId: number) {
        return this.orderRepo.updateStatus(orderId, body.status, userId);
    }
}
