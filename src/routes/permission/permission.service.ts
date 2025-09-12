import { Injectable } from '@nestjs/common';

import {
    CreatePermissionBodyType,
    GetPermissionsQueryType,
    UpdatePermissionBodyType,
} from 'src/routes/permission/permission.dto';

import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { PermissionAlreadyExistsException } from 'src/routes/permission/permission.error';
import { PermissionRepo } from 'src/shared/repositories/permission.repo';
import { NotFoundRecordException } from 'src/shared/types/error';

@Injectable()
export class PermissionService {
    constructor(private permissionRepo: PermissionRepo) {}

    async list(pagination: GetPermissionsQueryType) {
        const data = await this.permissionRepo.list(pagination);
        return data;
    }

    async findById(id: number) {
        const Permission = await this.permissionRepo.findById(id);
        if (!Permission) {
            throw NotFoundRecordException;
        }
        return Permission;
    }

    async create({ data, createdById }: { data: CreatePermissionBodyType; createdById: number }) {
        try {
            return await this.permissionRepo.create({
                createdById,
                data,
            });
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw PermissionAlreadyExistsException;
            }
            throw error;
        }
    }

    async update({ id, data, updatedById }: { id: number; data: UpdatePermissionBodyType; updatedById: number }) {
        try {
            const Permission = await this.permissionRepo.update({
                id,
                updatedById,
                data,
            });
            return Permission;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException;
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw PermissionAlreadyExistsException;
            }
            throw error;
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.permissionRepo.delete({
                id,
                deletedById,
            });
            return {
                message: 'Delete successfully',
            };
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException;
            }
            throw error;
        }
    }
}
