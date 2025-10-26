import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
    CreateDiscountCodeBodyDTO,
    GetDiscountCodeParamsDTO,
    GetDiscountCodesResDTO,
    GetDiscountCodesQueryDTO,
    DiscountCodeDTO,
    UpdateDiscountCodeBodyDTO,
} from './discount-code.dto';
import { DiscountCodeService } from './discount-code.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('discount-codes')
export class DiscountCodeController {
    constructor(private readonly discountCodeService: DiscountCodeService) {}

    @Get()
    list(@Query() query: GetDiscountCodesQueryDTO): Promise<GetDiscountCodesResDTO> {
        return this.discountCodeService.list(query);
    }

    @Get(':discountCodeId')
    findById(@Param() params: GetDiscountCodeParamsDTO): Promise<DiscountCodeDTO | null> {
        return this.discountCodeService.findById(params.discountCodeId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(
        @Body() body: CreateDiscountCodeBodyDTO,
        @ActiveUser('userId') userId: number,
    ): Promise<DiscountCodeDTO> {
        return this.discountCodeService.create(body, userId);
    }

    @Put(':discountCodeId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateDiscountCodeBodyDTO,
        @Param() params: GetDiscountCodeParamsDTO,
    ): Promise<DiscountCodeDTO> {
        return this.discountCodeService.update(params.discountCodeId, body);
    }

    @Delete(':discountCodeId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetDiscountCodeParamsDTO): Promise<DiscountCodeDTO> {
        return this.discountCodeService.delete(params.discountCodeId);
    }
}