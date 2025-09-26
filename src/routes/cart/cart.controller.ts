import { Controller, Get, Post, Body, Param, Put, Query } from '@nestjs/common';
import { CartService } from './cart.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import {
    AddToCartBodyDTO,
    DeleteCartBodyDTO,
    GetCartItemParamsDTO,
    GetCartResDTO,
    UpdateCartItemBodyDTO,
} from 'src/routes/cart/cart.dto';

@Controller('cart')
export class CartController {
    constructor(private readonly cartService: CartService) {}

    @Get()
    getCart(
        @ActiveUser('userId') userId: number,
        @Query() query: { page: number; limit: number },
    ): Promise<GetCartResDTO> {
        return this.cartService.getCart(userId, query);
    }

    @Post()
    addToCart(@Body() body: AddToCartBodyDTO, @ActiveUser('userId') userId: number) {
        return this.cartService.addToCart(userId, body);
    }

    @Put(':cartItemId')
    updateCartItem(@Param() param: GetCartItemParamsDTO, @Body() body: UpdateCartItemBodyDTO) {
        return this.cartService.updateCartItem(param.cartItemId, body);
    }

    @Post('delete')
    deleteCart(@Body() body: DeleteCartBodyDTO, @ActiveUser('userId') userId: number) {
        return this.cartService.deleteCart(userId, body);
    }
}
