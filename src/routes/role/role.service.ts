import { BadRequestException, Injectable } from '@nestjs/common';
import { RoleRepo } from 'src/shared/repositories/role.repository';
import { CreateRoleBodyType, GetRolesQueryType, UpdateRoleBodyType } from 'src/routes/role/role.dto';

import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { RoleAlreadyExistsException } from 'src/routes/role/role.error';
import { NotFoundRecordException } from 'src/shared/types/error';

@Injectable()
export class RoleService {
    constructor(private roleRepo: RoleRepo) {}

    async list(pagination: GetRolesQueryType) {
        const data = await this.roleRepo.list(pagination);
        return data;
    }

    async findById(id: number) {
        const role = await this.roleRepo.findById(id);
        if (!role) {
            throw NotFoundRecordException;
        }
        return role;
    }

    async create({ data, createdById }: { data: CreateRoleBodyType; createdById: number }) {
        try {
            const role = await this.roleRepo.create({
                createdById,
                data,
            });
            return role;
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw RoleAlreadyExistsException;
            }
            throw error;
        }
    }

    async update({ id, data, updatedById }: { id: number; data: UpdateRoleBodyType; updatedById: number }) {
        try {
            const role = await this.roleRepo.update({
                id,
                updatedById,
                data,
            });
            return role;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw NotFoundRecordException;
            }
            if (isUniqueConstraintPrismaError(error)) {
                throw RoleAlreadyExistsException;
            }
            if (error instanceof Error) {
                throw new BadRequestException(error.message);
            }
            throw error;
        }
    }

    async delete({ id, deletedById }: { id: number; deletedById: number }) {
        try {
            await this.roleRepo.delete({
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
