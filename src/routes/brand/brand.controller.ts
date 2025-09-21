import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreateBrandBodyDTO,
    GetBrandDetailResDTO,
    GetBrandParamsDTO,
    GetBrandsResDTO,
    GetBrandsQueryDTO,
    UpdateBrandBodyDTO,
} from 'src/routes/brand/brand.dto';
import { BrandService } from 'src/routes/brand/brand.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('brand')
export class BrandController {
    constructor(private readonly brandService: BrandService) {}

    @Get()
    list(@Query() query: GetBrandsQueryDTO) {
        return this.brandService.list(query);
    }

    @Get(':brandId')
    findById(@Param() params: GetBrandParamsDTO) {
        return this.brandService.findById(params.brandId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreateBrandBodyDTO, @ActiveUser('userId') userId: number) {
        return this.brandService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':brandId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateBrandBodyDTO,
        @Param() params: GetBrandParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.brandService.update({
            data: body,
            id: params.brandId,
            updatedById: userId,
        });
    }

    @Delete(':brandId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetBrandParamsDTO) {
        return this.brandService.delete(params.brandId);
    }
}
