import { Controller, Get, Query, Post, Body, Put, Param, Patch } from '@nestjs/common';
import { ZodResponse, ZodSerializerDto } from 'nestjs-zod';
import {
    CancelOrderBodyDTO,
    CreateOrderBodyDTO,
    GetOrderListQueryDTO,
    GetOrderListResType,
    GetOrderParamsDTO,
    UpdateOrderStatusBodyDTO,
} from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import type { TokenPayload } from 'src/shared/types/jwt.type';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    getOrder(@ActiveUser() user: TokenPayload, @Query() query: GetOrderListQueryDTO) {
        return this.orderService.list(user, query);
    }

    @Post()
    create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
        return this.orderService.create(userId, body);
    }
    @Get(':orderId')
    detail(@ActiveUser() user: TokenPayload, @Param() param: GetOrderParamsDTO) {
        return this.orderService.detail(user, param.orderId);
    }

    @Put(':orderId')
    cancel(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO, @Body() _: CancelOrderBodyDTO) {
        return this.orderService.cancel(userId, param.orderId);
    }

    @Patch(':orderId/status')
    updateStatus(
        @ActiveUser('userId') userId: number,
        @Param() param: GetOrderParamsDTO,
        @Body() body: UpdateOrderStatusBodyDTO,
    ) {
        return this.orderService.updateStatus(param.orderId, body, userId);
    }
}
