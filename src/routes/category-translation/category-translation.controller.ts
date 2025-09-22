import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreateCategoryTranslationBodyDTO,
    GetCategoryTranslationDetailResDTO,
    GetCategoryTranslationParamsDTO,
    GetCategoryTranslationsByCategoryParamsDTO,
    GetCategoryTranslationsResDTO,
    GetCategoryTranslationsQueryDTO,
    UpdateCategoryTranslationBodyDTO,
} from 'src/routes/category-translation/category-translation.dto';
import { CategoryTranslationService } from 'src/routes/category-translation/category-translation.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('category-translation')
export class CategoryTranslationController {
    constructor(private readonly categoryTranslationService: CategoryTranslationService) {}

    @Get()
    list(@Query() query: GetCategoryTranslationsQueryDTO) {
        return this.categoryTranslationService.list(query);
    }

    @Get('category/:categoryId')
    findByCategoryId(@Param() params: GetCategoryTranslationsByCategoryParamsDTO) {
        return this.categoryTranslationService.findByCategoryId(params.categoryId);
    }

    @Get(':categoryTranslationId')
    findById(@Param() params: GetCategoryTranslationParamsDTO) {
        return this.categoryTranslationService.findById(params.categoryTranslationId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreateCategoryTranslationBodyDTO, @ActiveUser('userId') userId: number) {
        return this.categoryTranslationService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':categoryTranslationId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateCategoryTranslationBodyDTO,
        @Param() params: GetCategoryTranslationParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.categoryTranslationService.update({
            data: body,
            id: params.categoryTranslationId,
            updatedById: userId,
        });
    }

    @Delete(':categoryTranslationId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetCategoryTranslationParamsDTO) {
        return this.categoryTranslationService.delete(params.categoryTranslationId);
    }
}
