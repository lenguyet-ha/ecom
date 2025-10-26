import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';

import {
    CreateProductBodyDTO,
    GetManageProductsQueryDTO,
    GetProductParamsDTO,
    UpdateProductBodyDTO,
    UpdateProductStatusBodyDTO,
} from 'src/routes/product/product.dto';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

import * as jwtType from 'src/shared/types/jwt.type';
import { ManageProductService } from './product-manage.service';

@Controller('manage-product/products')
export class ManageProductController {
    constructor(private readonly manageProductService: ManageProductService) {}

    @Get(':productId')
    getDetail(@Param() params: GetProductParamsDTO, @ActiveUser() user: jwtType.AccessTokenPayload) {
        return this.manageProductService.getDetail({
            productId: params.productId,
            userIdRequest: user.userId,
            roleNameRequest: user.roleName,
        });
    }
    @Get()
    list(@Query() query: GetManageProductsQueryDTO, @ActiveUser() user: jwtType.AccessTokenPayload) {
        return this.manageProductService.list({
            query,
            userIdRequest: user.userId,
            roleNameRequest: user.roleName,
        });
    }

    @Post()
    create(@Body() body: CreateProductBodyDTO, @ActiveUser() user: jwtType.AccessTokenPayload) {
        return this.manageProductService.create({
            data: body,
            createdById: user.userId,
            roleName: user.roleName
        });
    }

    @Put(':productId')
    update(
        @Body() body: UpdateProductBodyDTO,
        @Param() params: GetProductParamsDTO,
        @ActiveUser() user: jwtType.AccessTokenPayload,
    ) {
        return this.manageProductService.update({
            productId: params.productId,
            data: body,
            updatedById: user.userId,
            roleNameRequest: user.roleName,
        });
    }

    @Delete(':productId')
    delete(@Param() params: GetProductParamsDTO, @ActiveUser() user: jwtType.AccessTokenPayload) {
        return this.manageProductService.delete({
            productId: params.productId,
            deletedById: user.userId,
            roleNameRequest: user.roleName,
        });
    }

    @Put(':productId/status')
    updateStatus(
        @Body() body: UpdateProductStatusBodyDTO,
        @Param() params: GetProductParamsDTO,
        @ActiveUser() user: jwtType.AccessTokenPayload,
    ) {
        return this.manageProductService.updateStatus({
            productId: params.productId,
            status: body.status,
            updatedById: user.userId,
            roleNameRequest: user.roleName,
        });
    }
}
