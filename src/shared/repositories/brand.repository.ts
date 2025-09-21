import { Injectable } from '@nestjs/common';
import { BrandType, CreateBrandBodyType, UpdateBrandBodyType, GetBrandsQueryType, GetBrandsResType } from 'src/routes/brand/brand.dto';

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class BrandRepository {
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetBrandsQueryType): Promise<GetBrandsResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.brand.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.brand.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    brandTranslations: {
                        where: {
                            deletedAt: null,
                        },
                        include: {
                            language: true,
                        },
                    },
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

    findById(id: number): Promise<BrandType | null> {
        return this.prismaService.brand.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                brandTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
            },
        });
    }

    create({ createdById, data }: { createdById: number; data: CreateBrandBodyType }): Promise<BrandType> {
        return this.prismaService.brand.create({
            data: {
                ...data,
                createdById,
            },
            include: {
                brandTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
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
        data: UpdateBrandBodyType;
    }): Promise<BrandType> {
        return this.prismaService.brand.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                ...data,
                updatedById,
            },
            include: {
                brandTranslations: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        language: true,
                    },
                },
            },
        });
    }

    delete(id: number, isHard?: boolean): Promise<BrandType> {
        return isHard
            ? this.prismaService.brand.delete({
                  where: {
                      id,
                  },
              })
            : this.prismaService.brand.update({
                  where: {
                      id,
                      deletedAt: null,
                  },
                  data: {
                      deletedAt: new Date(),
                  },
              });
    }
}
