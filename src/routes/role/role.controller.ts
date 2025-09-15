import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import { CreateRoleBodyDTO, GetRoleParamsDTO, GetRolesQueryDTO, UpdateRoleBodyDTO } from 'src/routes/role/role.dto';
import { RoleService } from 'src/routes/role/role.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';

@Controller('roles')
export class RoleController {
    constructor(private readonly roleService: RoleService) {}

    @Get()
    list(@Query() query: GetRolesQueryDTO) {
        return this.roleService.list({
            page: query.page,
            limit: query.limit,
        });
    }

    @Get(':roleId')
    findById(@Param() params: GetRoleParamsDTO) {
        return this.roleService.findById(params.roleId);
    }

    @Post()
    create(@Body() body: CreateRoleBodyDTO, @ActiveUser('userId') userId: number) {
        return this.roleService.create({
            data: body,
            createdById: userId,
        });
    }

    @Put(':roleId')
    update(@Body() body: UpdateRoleBodyDTO, @Param() params: GetRoleParamsDTO, @ActiveUser('userId') userId: number) {
        return this.roleService.update({
            data: body,
            id: params.roleId,
            updatedById: userId,
        });
    }

    @Delete(':roleId')
    delete(@Param() params: GetRoleParamsDTO, @ActiveUser('userId') userId: number) {
        return this.roleService.delete({
            id: params.roleId,
            deletedById: userId,
        });
    }
}
