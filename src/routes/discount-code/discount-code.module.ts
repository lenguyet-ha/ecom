import { Module } from '@nestjs/common';
import { DiscountCodeController } from './discount-code.controller';
import { DiscountCodeService } from './discount-code.service';
import { DiscountCodeRepository } from './discount-code.repository';

@Module({
    controllers: [DiscountCodeController],
    providers: [DiscountCodeService, DiscountCodeRepository],
    exports: [DiscountCodeService, DiscountCodeRepository],
})
export class DiscountCodeModule {}