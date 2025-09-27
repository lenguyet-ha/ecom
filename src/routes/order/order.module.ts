import { Module } from '@nestjs/common';
import { OrderService } from './order.service';
import { OrderController } from 'src/routes/order/order.controller';
import { BullModule } from '@nestjs/bullmq';
import { OrderProducer } from './order.producer';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Module({
    imports: [
        BullModule.registerQueue({
            name: PAYMENT_QUEUE_NAME,
        }),
    ],
    providers: [OrderService, OrderProducer],
    controllers: [OrderController],
})
export class OrderModule {}
