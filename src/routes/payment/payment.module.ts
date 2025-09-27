import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BullModule } from '@nestjs/bullmq';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';
import { PaymentProducer } from './payment.producer';
import { PaymentRepo } from 'src/shared/repositories/payment.repo';

@Module({
    imports: [
        BullModule.registerQueue({
            name: PAYMENT_QUEUE_NAME,
        }),
    ],
    providers: [PaymentService, PaymentProducer, PaymentRepo],
    controllers: [PaymentController],
})
export class PaymentModule {}
