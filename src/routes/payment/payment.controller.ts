import { Controller, Post, Body } from '@nestjs/common';
import { PaymentService } from './payment.service';
import { ZodSerializerDto } from 'nestjs-zod';
import { WebhookPaymentBodyDTO } from 'src/routes/payment/payment.dto';
import { IsPublic } from 'src/shared/decorators/public.decorator';

@Controller('payment')
export class PaymentController {
    constructor(private readonly paymentService: PaymentService) {}

    @Post('/receiver')
    @IsPublic()
    receiver(@Body() body: WebhookPaymentBodyDTO) {
        return this.paymentService.receiver(body);
    }
}
