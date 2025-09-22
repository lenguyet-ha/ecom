import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreateCategoryBodyDTO,
    GetCategoryDetailResDTO,
    GetCategoryParamsDTO,
    GetCategoriesResDTO,
    GetCategoriesQueryDTO,
    UpdateCategoryBodyDTO,
} from 'src/routes/category/category.dto';
import { CategoryService } from 'src/routes/category/category.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('category')
export class CategoryController {
    constructor(private readonly categoryService: CategoryService) {}

    @Get()
    list(@Query() query: GetCategoriesQueryDTO) {
        return this.categoryService.list(query);
    }

    @Get(':categoryId')
    findById(@Param() params: GetCategoryParamsDTO) {
        return this.categoryService.findById(params.categoryId);
    }

    @Post()
    @Auth([AuthType.Bearer])
    create(@Body() body: CreateCategoryBodyDTO, @ActiveUser('userId') userId: number) {
        return this.categoryService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':categoryId')
    @Auth([AuthType.Bearer])
    update(
        @Body() body: UpdateCategoryBodyDTO,
        @Param() params: GetCategoryParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.categoryService.update({
            data: body,
            id: params.categoryId,
            updatedById: userId,
        });
    }

    @Delete(':categoryId')
    @Auth([AuthType.Bearer])
    delete(@Param() params: GetCategoryParamsDTO) {
        return this.categoryService.delete(params.categoryId);
    }
}
