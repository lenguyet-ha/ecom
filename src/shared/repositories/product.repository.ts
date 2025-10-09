import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    CreateProductBodyType,
    GetProductDetailResType,
    GetProductsQueryType,
    GetProductsResType,
    ProductType,
} from 'src/routes/product/product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductRepository {
    constructor(private prismaService: PrismaService) {}

    async getList(query: GetProductsQueryType): Promise<GetProductsResType> {
        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const skip = (page - 1) * limit;

        let where: Prisma.ProductWhereInput = {
            deletedAt: null,
        };

        if (query.name) {
            where.name = {
                contains: query.name,
                mode: 'insensitive',
            };
        }

        if (query.brandIds && query.brandIds.length) {
            where.brandId = { in: query.brandIds };
        }

        if (query.categories && query.categories.length) {
            where.categories = {
                some: {
                    id: { in: query.categories },
                },
            };
        }

        if (query.createdById) {
            where.createdById = query.createdById;
        }

        if (query.isPublished === true) {
            where.publishedAt = query.isPublished ? { lte: new Date(), not: null } : undefined;
        } else if (query.isPublished === false) {
            where = {
                ...where,
                OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
            };
        }

        if (typeof query.minPrice === 'number' || typeof query.maxPrice === 'number') {
            where.AND = [];
            if (typeof query.minPrice === 'number') {
                where.AND.push({ basePrice: { gte: query.minPrice } });
            }
            if (typeof query.maxPrice === 'number') {
                where.AND.push({ basePrice: { lte: query.maxPrice } });
            }
        }

        // Sorting
        const orderBy: any = {};
        if (query.sortBy === 'price') {
            orderBy.basePrice = query.orderBy === 'asc' ? 'asc' : 'desc';
        } else if (query.sortBy === 'sale') {
            orderBy.virtualPrice = query.orderBy === 'asc' ? 'asc' : 'desc';
        } else {
            orderBy.createdAt = query.orderBy === 'asc' ? 'asc' : 'desc';
        }

        const [totalItems, data] = await Promise.all([
            this.prismaService.product.count({ where }),
            this.prismaService.product.findMany({
                where,
                include: {
                    productTranslations: {
                        where: {
                            languageId: 'vi',
                            deletedAt: null,
                        },
                        include: {
                            language: true,
                        },
                    },
                    categories: {
                        where: { deletedAt: null },
                    },
                    brand: true,
                    skus: {
                        where: { deletedAt: null },
                    },
                    createdBy: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy,
            }),
        ]);

        // Normalize categories to simple array
        const normalized = data.map((product: any) => {
            // product.categories is already an array of Category because relation is direct

            return {
                id: product.id,
                publishedAt: product.publishedAt,
                name: product.name,
                descriprion: product.productTranslations?.[0]?.description ?? null,
                basePrice: product.basePrice,
                virtualPrice: product.virtualPrice,
                brandId: product.brandId,
                images: product.images,
                variants: product.variants,
                createdById: product.createdById,
                shopInfo: product.createdBy
                    ? {
                          id: product.createdBy.id,
                          name: product.createdBy.name,
                          avatar: product.createdBy.avatar,
                      }
                    : null,
                categories: product.categories.map((cat: any) => ({
                    id: cat.id,
                    name: cat.name,
                    logo: cat.logo,
                    parentCategoryId: cat.parentCategoryId,
                })),

                skus:
                    product.skus.map((sku) => ({
                        id: sku.id,
                        value: sku.value,
                        price: sku.price,
                        stock: sku.stock,
                        image: sku.image,
                    })) ?? [],
            } as any;
        });

        return {
            data: normalized,
            totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    async findById(id: number, isPublished?: boolean): Promise<GetProductDetailResType | null> {
        let where: Prisma.ProductWhereInput = {
            id,
            deletedAt: null,
        };

        if (isPublished === true) {
            where.publishedAt = { lte: new Date(), not: null };
        } else if (isPublished === false) {
            where = {
                ...where,
                OR: [{ publishedAt: null }, { publishedAt: { gt: new Date() } }],
            };
        }
        const result = await this.prismaService.product.findFirst({
            where,
            include: {
                productTranslations: {
                    where: { languageId: 'vi', deletedAt: null },
                },
                skus: {
                    where: {
                        deletedAt: null,
                    },
                },
                brand: true,
                categories: {
                    where: {
                        deletedAt: null,
                    },
                },
                // [THÊM VÀO] Lấy thông tin người tạo sản phẩm
                createdBy: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
        });

        if (!result) {
            return null;
        }

        // Transform Date fields to strings and strip create/update/delete metadata
        const transformedResult: any = {
            id: result.id,
            publishedAt: result.publishedAt?.toISOString() || null,
            name: result.name,
            basePrice: result.basePrice,
            virtualPrice: result.virtualPrice,
            brandId: result.brandId,
            images: result.images,
            variants: result.variants,
            description: result.productTranslations?.[0]?.description ?? null,
            createdById: result.createdById,

            // [THÊM VÀO] Thêm trường shopInfo vào kết quả trả về
            shopInfo: result.createdBy
                ? {
                      id: result.createdBy.id,
                      name: result.createdBy.name,
                      avatar: result.createdBy.avatar,
                  }
                : null,

            // skus (only core fields + timestamps)
            skus: result.skus.map((sku: any) => ({
                id: sku.id,
                value: sku.value,
                price: sku.price,
                stock: sku.stock,
                image: sku.image,
                productId: sku.productId,
            })),

            // brand (core fields + translations)
            brand: result.brand
                ? {
                      id: result.brand.id,
                      name: result.brand.name,
                      logo: result.brand.logo,
                  }
                : null,

            // categories (core fields + translations)
            categories: (result.categories || []).map((cat: any) => ({
                id: cat.id,
                name: cat.name,
                logo: cat.logo,
                parentCategoryId: cat.parentCategoryId,
            })),
        };

        return transformedResult;
    }
    async delete({ id, deletedById }: { id: number; deletedById: number }): Promise<ProductType> {
        const now = new Date();
        const [product] = await Promise.all([
            this.prismaService.product.update({
                where: { id, deletedAt: null },
                data: { deletedAt: now, deletedById },
            }),
            this.prismaService.sKU.updateMany({
                where: { productId: id, deletedAt: null },
                data: { deletedAt: now, deletedById },
            }),
            this.prismaService.productTranslation.updateMany({
                where: { productId: id, deletedAt: null },
                data: { deletedAt: now, deletedById },
            }),
        ]);
        return product;
    }

    async create({ createdById, data }: { createdById: number; data: CreateProductBodyType }): Promise<any> {
        const { skus, categories, ...productData } = data;
        const result = this.prismaService.product.create({
            data: {
                createdById,
                ...productData,
                categories: {
                    connect: categories.map((category) => ({ id: category })),
                },
                skus: {
                    createMany: {
                        data: skus.map((sku) => ({ ...sku, createdById })),
                    },
                },
            },
            include: {
                productTranslations: {
                    where: { deletedAt: null },
                },
                skus: {
                    where: { deletedAt: null },
                },
                brand: {
                    include: {
                        brandTranslations: {
                            where: { deletedAt: null },
                        },
                    },
                },
                categories: {
                    where: {
                        deletedAt: null,
                    },
                    include: {
                        categoryTranslations: {
                            where: { deletedAt: null },
                        },
                    },
                },
            },
        });
        return result;
    }

    async update({
        id,
        updatedById,
        data,
    }: {
        id: number;
        updatedById: number;
        data: CreateProductBodyType;
    }): Promise<any> {
        const { skus: dataSkus, categories, ...productData } = data;

        const existingSKUs = await this.prismaService.sKU.findMany({
            where: {
                productId: id,
                deletedAt: null,
            },
        });

        const skusToDelete = existingSKUs.filter((sku) => dataSkus?.every((dataSku) => dataSku.value !== sku.value));
        const skuIdsToDelete = skusToDelete.map((sku) => sku.id);

        const skusWithId =
            dataSkus?.map((dataSku) => {
                const existingSku = existingSKUs.find((existingSKU) => existingSKU.value === dataSku.value);
                return {
                    ...dataSku,
                    id: existingSku?.id,
                };
            }) ?? [];

        const skusToUpdate = skusWithId.filter((sku) => sku.id != null);

        const skusToCreate = skusWithId
            .filter((sku) => sku.id == null)
            .map((sku) => {
                const { id: skuId, ...data } = sku;
                return {
                    ...data,
                    productId: id,
                    createdById: updatedById,
                };
            });

        const [product] = await this.prismaService.$transaction([
            this.prismaService.product.update({
                where: { id, deletedAt: null },
                data: {
                    ...productData,
                    updatedById,
                    categories: {
                        set: categories?.map((category) => ({ id: category })) || [],
                    },
                },
            }),

            this.prismaService.sKU.updateMany({
                where: {
                    id: { in: skuIdsToDelete },
                },
                data: {
                    deletedAt: new Date(),
                    deletedById: updatedById,
                },
            }),

            ...skusToUpdate.map((sku) =>
                this.prismaService.sKU.update({
                    where: { id: sku.id!, deletedAt: null },
                    data: {
                        value: sku.value,
                        price: sku.price,
                        stock: sku.stock,
                        image: sku.image,
                        updatedById,
                    },
                }),
            ),

            this.prismaService.sKU.createMany({
                data: skusToCreate,
            }),
        ]);
        return product;
    }
}
