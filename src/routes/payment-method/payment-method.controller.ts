import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
    CreatePaymentMethodBodyDTO,
    GetPaymentMethodParamsDTO,
    GetPaymentMethodsResDTO,
    GetPaymentMethodsQueryDTO,
    PaymentMethodDTO,
    UpdatePaymentMethodBodyDTO,
} from './payment-method.dto';
import { PaymentMethodService } from './payment-method.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('payment-methods')
export class PaymentMethodController {
    constructor(private readonly paymentMethodService: PaymentMethodService) {}

    @Get()
    list(@Query() query: GetPaymentMethodsQueryDTO): Promise<GetPaymentMethodsResDTO> {
        return this.paymentMethodService.list(query);
    }

    @Get(':paymentMethodId')
    findById(@Param() params: GetPaymentMethodParamsDTO): Promise<PaymentMethodDTO | null> {
        return this.paymentMethodService.findById(params.paymentMethodId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreatePaymentMethodBodyDTO): Promise<PaymentMethodDTO> {
        return this.paymentMethodService.create(body);
    }

    @Put(':paymentMethodId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdatePaymentMethodBodyDTO,
        @Param() params: GetPaymentMethodParamsDTO,
    ): Promise<PaymentMethodDTO> {
        return this.paymentMethodService.update(params.paymentMethodId, body);
    }

    @Delete(':paymentMethodId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetPaymentMethodParamsDTO): Promise<PaymentMethodDTO> {
        return this.paymentMethodService.delete(params.paymentMethodId);
    }
}