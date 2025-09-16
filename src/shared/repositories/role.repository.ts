import { Injectable } from '@nestjs/common';
import {
    CreateRoleBodyType,
    GetRolesQueryType,
    GetRolesResType,
    RoleType,
    RoleWithPermissionsType,
    UpdateRoleBodyType,
} from 'src/routes/role/role.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { RoleName } from '../constants/role.constant';

@Injectable()
export class RoleRepo {
    private clientRoleId: number | null = null;
    private adminRoleId: number | null = null;
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetRolesQueryType): Promise<GetRolesResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.role.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.role.findMany({
                where: {
                    deletedAt: null,
                },
                skip,
                take,
            }),
        ]);
        return {
            data,
            totalItems,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(totalItems / pagination.limit),
        };
    }

    findById(id: number): Promise<RoleWithPermissionsType | null> {
        return this.prismaService.role.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                permissions: {
                    where: {
                        deletedAt: null,
                    },
                },
            },
        });
    }

    create({ createdById, data }: { createdById: number | null; data: CreateRoleBodyType }): Promise<RoleType> {
        return this.prismaService.role.create({
            data: {
                ...data,
                createdById,
            },
        });
    }

    update({
        id,
        updatedById,
        data,
    }: {
        id: number;
        updatedById: number;
        data: UpdateRoleBodyType;
    }): Promise<RoleType> {
        return this.prismaService.role.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                name: data.name,
                description: data.description,
                isActive: data.isActive,
                permissions: {
                    set: data.permissionIds.map((id) => ({ id })),
                },
                updatedById,
            },
            include: {
                permissions: true,
            },
        });
    }

    delete(
        {
            id,
            deletedById,
        }: {
            id: number;
            deletedById: number;
        },
        isHard?: boolean,
    ): Promise<RoleType> {
        return isHard
            ? this.prismaService.role.delete({
                  where: {
                      id,
                  },
              })
            : this.prismaService.role.update({
                  where: {
                      id,
                      deletedAt: null,
                  },
                  data: {
                      deletedAt: new Date(),
                      deletedById,
                  },
              });
    }
    async getClientRoleId(): Promise<number> {
        if (this.clientRoleId !== null) {
            return this.clientRoleId;
        }
        const role = await this.prismaService.role.findFirst({
            where: { name: RoleName.CLIENT, deletedAt: null },
        });
        if (!role) {
            throw new Error('Client role not found');
        }
        this.clientRoleId = role.id;
        return role.id;
    }
    async getAdminRoleId() {
        if (this.adminRoleId) {
            return this.adminRoleId;
        }
        const role = await this.prismaService.role.findFirst({
            where: { name: RoleName.ADMIN, deletedAt: null },
        });
        if (!role) {
            throw new Error('Client role not found');
        }
        this.adminRoleId = role.id;
        return role.id;
    }
}
