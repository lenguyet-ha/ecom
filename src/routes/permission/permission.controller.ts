import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreatePermissionBodyDTO,
    GetPermissionDetailResDTO,
    GetPermissionParamsDTO,
    GetPermissionsQueryDTO,
    GetPermissionsResDTO,
    UpdatePermissionBodyDTO,
} from 'src/routes/permission/permission.dto';
import { PermissionService } from 'src/routes/permission/permission.service';
import { AuthType } from 'src/shared/constants/auth.constant';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';

@Controller('permissions')
@Auth([AuthType.Bearer])
export class PermissionController {
    constructor(private readonly permissionService: PermissionService) {}

    @Get()
    list(@Query() query: GetPermissionsQueryDTO) {
        return this.permissionService.list({
            page: query.page,
            limit: query.limit,
        });
    }

    @Get(':permissionId')
    @ZodSerializerDto(GetPermissionDetailResDTO)
    findById(@Param() params: GetPermissionParamsDTO) {
        return this.permissionService.findById(params.permissionId);
    }

    @Post()
    create(@Body() body: CreatePermissionBodyDTO, @ActiveUser('userId') userId: number) {
        return this.permissionService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':permissionId')
    update(
        @Body() body: UpdatePermissionBodyDTO,
        @Param() params: GetPermissionParamsDTO,
        @ActiveUser('userId') userId: number,
    ) {
        return this.permissionService.update({
            data: body,
            id: params.permissionId,
            updatedById: userId,
        });
    }

    @Delete(':permissionId')
    delete(@Param() params: GetPermissionParamsDTO, @ActiveUser('userId') userId: number) {
        return this.permissionService.delete({
            id: params.permissionId,
            deletedById: userId,
        });
    }
}
