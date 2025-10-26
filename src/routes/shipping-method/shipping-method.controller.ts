import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
    CreateShippingMethodBodyDTO,
    GetShippingMethodParamsDTO,
    GetShippingMethodsResDTO,
    GetShippingMethodsQueryDTO,
    ShippingMethodDTO,
    UpdateShippingMethodBodyDTO,
} from './shipping-method.dto';
import { ShippingMethodService } from './shipping-method.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('shipping-methods')
export class ShippingMethodController {
    constructor(private readonly shippingMethodService: ShippingMethodService) {}

    @Get()
    list(@Query() query: GetShippingMethodsQueryDTO): Promise<GetShippingMethodsResDTO> {
        return this.shippingMethodService.list(query);
    }

    @Get(':shippingMethodId')
    findById(@Param() params: GetShippingMethodParamsDTO): Promise<ShippingMethodDTO | null> {
        return this.shippingMethodService.findById(params.shippingMethodId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreateShippingMethodBodyDTO): Promise<ShippingMethodDTO> {
        return this.shippingMethodService.create(body);
    }

    @Put(':shippingMethodId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateShippingMethodBodyDTO,
        @Param() params: GetShippingMethodParamsDTO,
    ): Promise<ShippingMethodDTO> {
        return this.shippingMethodService.update(params.shippingMethodId, body);
    }

    @Delete(':shippingMethodId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetShippingMethodParamsDTO): Promise<ShippingMethodDTO> {
        return this.shippingMethodService.delete(params.shippingMethodId);
    }
}