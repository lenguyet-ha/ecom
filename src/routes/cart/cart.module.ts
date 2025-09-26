import { Module } from '@nestjs/common';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { CartRepo } from 'src/shared/repositories/cart.repo';

@Module({
    providers: [CartService, CartRepo],
    controllers: [CartController],
})
export class CartModule {}
