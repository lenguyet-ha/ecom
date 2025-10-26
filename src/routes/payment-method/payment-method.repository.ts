import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    CreatePaymentMethodBodyType,
    GetPaymentMethodsQueryType,
    GetPaymentMethodsResType,
    PaymentMethodType,
    UpdatePaymentMethodBodyType,
} from './payment-method.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class PaymentMethodRepository {
    constructor(private prismaService: PrismaService) {}

    async getList(query: GetPaymentMethodsQueryType): Promise<GetPaymentMethodsResType> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        const where: Prisma.PaymentMethodWhereInput = {};

        if (typeof query.isActive === 'boolean') {
            where.isActive = query.isActive;
        }

        const [totalItems, data] = await Promise.all([
            this.prismaService.paymentMethod.count({ where }),
            this.prismaService.paymentMethod.findMany({
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

    async findById(id: number): Promise<PaymentMethodType | null> {
        return this.prismaService.paymentMethod.findUnique({
            where: { id },
        });
    }

    async create(data: CreatePaymentMethodBodyType): Promise<PaymentMethodType> {
        return this.prismaService.paymentMethod.create({
            data,
        });
    }

    async update(id: number, data: UpdatePaymentMethodBodyType): Promise<PaymentMethodType> {
        return this.prismaService.paymentMethod.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<PaymentMethodType> {
        return this.prismaService.paymentMethod.delete({
            where: { id },
        });
    }
}