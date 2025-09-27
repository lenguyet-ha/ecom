import { Injectable } from '@nestjs/common';
import { PaymentRepo } from 'src/shared/repositories/payment.repo';
import { WebhookPaymentBodyType } from './payment.dto';

@Injectable()
export class PaymentService {
    constructor(private readonly paymentRepo: PaymentRepo) {}

    receiver(body: WebhookPaymentBodyType) {
        return this.paymentRepo.receiver(body);
    }
}
