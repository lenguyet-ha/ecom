import { Injectable } from '@nestjs/common';
import { CartRepo } from 'src/shared/repositories/cart.repo';
import { AddToCartBodyType, DeleteCartBodyType, UpdateCartItemBodyType } from './cart.dto';

@Injectable()
export class CartService {
    constructor(private readonly cartRepo: CartRepo) {}

    getCart(userId: number, query: { page: number; limit: number }) {
        return this.cartRepo.list({
            userId,
            page: query.page,
            limit: query.limit,
        });
    }

    addToCart(userId: number, body: AddToCartBodyType) {
        return this.cartRepo.create(userId, body);
    }

    updateCartItem(cartItemId: number, body: UpdateCartItemBodyType) {
        return this.cartRepo.update(cartItemId, body);
    }

    async deleteCart(userId: number, body: DeleteCartBodyType) {
        const { count } = await this.cartRepo.delete(userId, body);
        return {
            message: `${count} item(s) deleted from cart`,
        };
    }
}
