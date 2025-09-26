import { Controller, Get, Query, Post, Body, Put, Param } from '@nestjs/common';
import { ZodResponse, ZodSerializerDto } from 'nestjs-zod';
import {
    CancelOrderBodyDTO,
    CreateOrderBodyDTO,
    GetOrderListQueryDTO,
    GetOrderListResType,
    GetOrderParamsDTO,
} from 'src/routes/order/order.dto';
import { OrderService } from 'src/routes/order/order.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('orders')
export class OrderController {
    constructor(private readonly orderService: OrderService) {}

    @Get()
    getOrder(@ActiveUser('userId') userId: number, @Query() query: GetOrderListQueryDTO) {
        return this.orderService.list(userId, query);
    }

    @Post()
    create(@ActiveUser('userId') userId: number, @Body() body: CreateOrderBodyDTO) {
        return this.orderService.create(userId, body);
    }
    @Get(':orderId')
    detail(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO) {
        return this.orderService.detail(userId, param.orderId);
    }

    @Put(':orderId')
    cancel(@ActiveUser('userId') userId: number, @Param() param: GetOrderParamsDTO, @Body() _: CancelOrderBodyDTO) {
        return this.orderService.cancel(userId, param.orderId);
    }
}
