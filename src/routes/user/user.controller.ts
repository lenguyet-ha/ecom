import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ZodSerializerDto } from 'nestjs-zod';
import {
    CreateUserBodyDTO,
    CreateUserResDTO,
    GetUserParamsDTO,
    GetUsersQueryDTO,
    GetUsersResDTO,
    UpdateUserBodyDTO,
} from 'src/routes/user/user.dto';
import { UserService } from 'src/routes/user/user.service';
import { ActiveRolePermissions } from 'src/shared/decorators/active-role-permissions.decorator';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { GetUserProfileResDTO, UpdateProfileResDTO } from '../auth/auth.dto';

@Controller('users')
export class UserController {
    constructor(private readonly userService: UserService) {}

    @Get()
    list(@Query() query: GetUsersQueryDTO) {
        return this.userService.list({
            page: query.page,
            limit: query.limit,
        });
    }

    @Get(':userId')
    findById(@Param() params: GetUserParamsDTO) {
        return this.userService.findById(params.userId);
    }

    @Post()
    create(
        @Body() body: CreateUserBodyDTO,
        @ActiveUser('userId') userId: number,
        @ActiveRolePermissions('name') roleName: string,
    ) {
        return this.userService.create({
            data: body,
            createdById: userId,
            createdByRoleName: roleName,
        });
    }

    @Put(':userId')
    update(
        @Body() body: UpdateUserBodyDTO,
        @Param() params: GetUserParamsDTO,
        @ActiveUser('userId') userId: number,
        @ActiveRolePermissions('name') roleName: string,
    ) {
        return this.userService.update({
            data: body,
            id: params.userId,
            updatedById: userId,
            updatedByRoleName: roleName,
        });
    }

    @Delete(':userId')
    delete(
        @Param() params: GetUserParamsDTO,
        @ActiveUser('userId') userId: number,
        @ActiveRolePermissions('name') roleName: string,
    ) {
        return this.userService.delete({
            id: params.userId,
            deletedById: userId,
            deletedByRoleName: roleName,
        });
    }
}
