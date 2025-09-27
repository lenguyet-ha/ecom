import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/shared/repositories/payment.repo';
import { WebhookPaymentBodyType } from './payment.dto';
import { PaymentProducer } from './payment.producer';

@Injectable()
export class PaymentService {
    constructor(
        private readonly paymentRepo: PaymentRepo,
        private readonly paymentProducer: PaymentProducer,
    ) {}

    async receiver(body: WebhookPaymentBodyType) {
        const { paymentId, message } = await this.paymentRepo.receiver(body);
        await this.paymentProducer.removeJob(paymentId); // Remove the job from the queue
        return {
            message,
        };
    }
}
