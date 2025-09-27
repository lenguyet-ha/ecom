import { Module } from '@nestjs/common';
import { PaymentController } from './payment.controller';
import { PaymentService } from './payment.service';
import { BullModule } from '@nestjs/bullmq';
import { PaymentConsumer } from 'src/queues/payment.consumer';
import { SharedPaymentRepository } from 'src/shared/repositories/shared-payment.repo';
import { PAYMENT_QUEUE_NAME } from 'src/shared/constants/queue.constant';

@Module({
    imports: [
        BullModule.registerQueue({
            name: PAYMENT_QUEUE_NAME,
        }),
    ],
    providers: [PaymentService, PaymentConsumer, SharedPaymentRepository],
    controllers: [PaymentController],
})
export class PaymentModule {}
