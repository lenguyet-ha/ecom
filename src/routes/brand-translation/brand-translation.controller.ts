import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreateBrandTranslationBodyDTO,
    GetBrandTranslationDetailResDTO,
    GetBrandTranslationParamsDTO,
    GetBrandTranslationsByBrandParamsDTO,
    GetBrandTranslationsResDTO,
    GetBrandTranslationsQueryDTO,
    UpdateBrandTranslationBodyDTO,
} from 'src/routes/brand-translation/brand-translation.dto';
import { BrandTranslationService } from 'src/routes/brand-translation/brand-translation.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('brand-translation')
export class BrandTranslationController {
    constructor(private readonly brandTranslationService: BrandTranslationService) {}

    @Get()
    list(@Query() query: GetBrandTranslationsQueryDTO) {
        return this.brandTranslationService.list(query);
    }

    @Get('brand/:brandId')
    findByBrandId(@Param() params: GetBrandTranslationsByBrandParamsDTO) {
        return this.brandTranslationService.findByBrandId(params.brandId);
    }

    @Get(':brandTranslationId')
    findById(@Param() params: GetBrandTranslationParamsDTO) {
        return this.brandTranslationService.findById(params.brandTranslationId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreateBrandTranslationBodyDTO, @ActiveUser('userId') userId: number) {
        return this.brandTranslationService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':brandTranslationId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateBrandTranslationBodyDTO,
        @Param() params: GetBrandTranslationParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.brandTranslationService.update({
            data: body,
            id: params.brandTranslationId,
            updatedById: userId,
        });
    }

    @Delete(':brandTranslationId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetBrandTranslationParamsDTO) {
        return this.brandTranslationService.delete(params.brandTranslationId);
    }
}
