import { Injectable } from '@nestjs/common';
import { CategoryTranslationType, CreateCategoryTranslationBodyType, UpdateCategoryTranslationBodyType, GetCategoryTranslationsQueryType, GetCategoryTranslationsResType } from 'src/routes/category-translation/category-translation.dto';
import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CategoryTranslationRepository {
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetCategoryTranslationsQueryType): Promise<GetCategoryTranslationsResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.categoryTranslation.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.categoryTranslation.findMany({
                where: {
                    deletedAt: null,
                },
                include: {
                    category: true,
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

    async findByCategoryId(categoryId: number): Promise<CategoryTranslationType[]> {
        return await this.prismaService.categoryTranslation.findMany({
            where: {
                categoryId,
                deletedAt: null,
            },
            include: {
                category: true,
                language: true,
            },
        });
    }

    findById(id: number): Promise<CategoryTranslationType | null> {
        return this.prismaService.categoryTranslation.findUnique({
            where: {
                id,
                deletedAt: null,
            },
            include: {
                category: true,
                language: true,
            },
        });
    }

    create({ createdById, data }: { createdById: number; data: CreateCategoryTranslationBodyType }): Promise<CategoryTranslationType> {
        return this.prismaService.categoryTranslation.create({
            data: {
                ...data,
                createdById,
            },
            include: {
                category: true,
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
        data: UpdateCategoryTranslationBodyType;
    }): Promise<CategoryTranslationType> {
        return this.prismaService.categoryTranslation.update({
            where: {
                id,
                deletedAt: null,
            },
            data: {
                ...data,
                updatedById,
            },
            include: {
                category: true,
                language: true,
            },
        });
    }

    delete(id: number, isHard?: boolean): Promise<CategoryTranslationType> {
        return isHard
            ? this.prismaService.categoryTranslation.delete({
                  where: {
                      id,
                  },
              })
            : this.prismaService.categoryTranslation.update({
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
