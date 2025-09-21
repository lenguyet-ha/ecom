import { Injectable } from '@nestjs/common';
import { BrandTranslationType, CreateBrandTranslationBodyType, UpdateBrandTranslationBodyType, GetBrandTranslationsQueryType, GetBrandTranslationsResType } from 'src/routes/brand-translation/brand-translation.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class BrandTranslationRepository {
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetBrandTranslationsQueryType): Promise<GetBrandTranslationsResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.brandTranslation.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.brandTranslation.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    brand: true,
                    language: true,
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

    async findByBrandId(brandId: number): Promise<BrandTranslationType[]> {
        return await this.prismaService.brandTranslation.findMany({
            where: {
                brandId,
                deletedAt: null,
            },
            include: {
                brand: true,
                language: true,
            },
        });
    }

    findById(id: number): Promise<BrandTranslationType | null> {
        return this.prismaService.brandTranslation.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                brand: true,
                language: true,
            },
        });
    }

    create({ createdById, data }: { createdById: number; data: CreateBrandTranslationBodyType }): Promise<BrandTranslationType> {
        return this.prismaService.brandTranslation.create({
            data: {
                ...data,
                createdById,
            },
            include: {
                brand: true,
                language: true,
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
        data: UpdateBrandTranslationBodyType;
    }): Promise<BrandTranslationType> {
        return this.prismaService.brandTranslation.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                ...data,
                updatedById,
            },
            include: {
                brand: true,
                language: true,
            },
        });
    }

    delete(id: number, isHard?: boolean): Promise<BrandTranslationType> {
        return isHard
            ? this.prismaService.brandTranslation.delete({
                  where: {
                      id,
                  },
              })
            : this.prismaService.brandTranslation.update({
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
