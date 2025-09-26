import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from 'src/routes/order/order.controller';

@Module({
    providers: [OrderService],
    controllers: [OrderController],
})
export class OrderModule {}
