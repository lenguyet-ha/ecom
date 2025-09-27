import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/shared/repositories/payment.repo';
import { WebhookPaymentBodyType } from './payment.dto';
import { PaymentProducer } from './payment.producer';

@Injectable()
export class PaymentService {
    constructor(private readonly paymentRepo: PaymentRepo) {}

    async receiver(body: WebhookPaymentBodyType) {
        const result = await this.paymentRepo.receiver(body);
        return result;
    }
}
