import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    CreateDiscountCodeBodyType,
    GetDiscountCodesQueryType,
    GetDiscountCodesResType,
    DiscountCodeType,
    UpdateDiscountCodeBodyType,
} from './discount-code.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class DiscountCodeRepository {
    constructor(private prismaService: PrismaService) {}

    async getList(query: GetDiscountCodesQueryType): Promise<GetDiscountCodesResType> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.DiscountCodeWhereInput = {};

        if (typeof query.isActive === 'boolean') {
            where.isActive = query.isActive;
        }

        if (query.bearer) {
            where.bearer = query.bearer;
        }

        if (query.shopId) {
            where.shopId = query.shopId;
        }

        const [totalItems, data] = await Promise.all([
            this.prismaService.discountCode.count({ where }),
            this.prismaService.discountCode.findMany({
                where,
                skip,
                take: limit,
                include: {
                    shop: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);

        return {
            data,
            totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    async findById(id: number): Promise<DiscountCodeType | null> {
        return this.prismaService.discountCode.findUnique({
            where: { id },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async create(data: CreateDiscountCodeBodyType, createdById: number): Promise<DiscountCodeType> {
        return this.prismaService.discountCode.create({
            data: {
                ...data,
                createdById,
            },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async update(id: number, data: UpdateDiscountCodeBodyType): Promise<DiscountCodeType> {
        return this.prismaService.discountCode.update({
            where: { id },
            data,
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }

    async delete(id: number): Promise<DiscountCodeType> {
        return this.prismaService.discountCode.delete({
            where: { id },
            include: {
                shop: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                    },
                },
            },
        });
    }
}