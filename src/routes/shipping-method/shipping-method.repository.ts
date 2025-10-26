import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    CreateShippingMethodBodyType,
    GetShippingMethodsQueryType,
    GetShippingMethodsResType,
    ShippingMethodType,
    UpdateShippingMethodBodyType,
} from './shipping-method.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ShippingMethodRepository {
    constructor(private prismaService: PrismaService) {}

    async getList(query: GetShippingMethodsQueryType): Promise<GetShippingMethodsResType> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.ShippingMethodWhereInput = {};

        if (typeof query.isActive === 'boolean') {
            where.isActive = query.isActive;
        }

        const [totalItems, data] = await Promise.all([
            this.prismaService.shippingMethod.count({ where }),
            this.prismaService.shippingMethod.findMany({
                where,
                skip,
                take: limit,
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

    async findById(id: number): Promise<ShippingMethodType | null> {
        return this.prismaService.shippingMethod.findUnique({
            where: { id },
        });
    }

    async create(data: CreateShippingMethodBodyType): Promise<ShippingMethodType> {
        return this.prismaService.shippingMethod.create({
            data,
        });
    }

    async update(id: number, data: UpdateShippingMethodBodyType): Promise<ShippingMethodType> {
        return this.prismaService.shippingMethod.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<ShippingMethodType> {
        return this.prismaService.shippingMethod.delete({
            where: { id },
        });
    }
}