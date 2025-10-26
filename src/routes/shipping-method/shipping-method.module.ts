import { Module } from '@nestjs/common';
import { ShippingMethodController } from './shipping-method.controller';
import { ShippingMethodService } from './shipping-method.service';
import { ShippingMethodRepository } from './shipping-method.repository';

@Module({
    controllers: [ShippingMethodController],
    providers: [ShippingMethodService, ShippingMethodRepository],
    exports: [ShippingMethodService, ShippingMethodRepository],
})
export class ShippingMethodModule {}