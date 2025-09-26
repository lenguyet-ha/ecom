import { Injectable } from '@nestjs/common';
import {
    AddToCartBodyType,
    CartItemType,
    DeleteCartBodyType,
    GetCartResType,
    UpdateCartItemBodyType,
} from 'src/routes/cart/cart.dto';
import { NotFoundSKUException, OutOfStockSKUException, ProductNotFoundException } from 'src/routes/cart/cart.error';

import { SKUSchemaType } from 'src/routes/product/sku.model';

import { PrismaService } from 'src/shared/services/prisma.service';

@Injectable()
export class CartRepo {
    constructor(private readonly prismaService: PrismaService) {}

    private async validateSKU(skuId: number, quantity: number): Promise<SKUSchemaType> {
        const sku = await this.prismaService.sKU.findUnique({
            where: { id: skuId, deletedAt: null },
            include: {
                product: true,
            },
        });
        // Kiểm tra tồn tại của SKU
        if (!sku) {
            throw NotFoundSKUException;
        }
        // Kiểm tra lượng hàng còn lại
        if (sku.stock < 1 || sku.stock < quantity) {
            throw OutOfStockSKUException;
        }
        const { product } = sku;

        // Kiểm tra sản phẩm đã bị xóa hoặc có công khai hay không
        if (
            product.deletedAt !== null ||
            product.publishedAt === null ||
            (product.publishedAt !== null && product.publishedAt > new Date())
        ) {
            throw ProductNotFoundException;
        }
        return sku as any;
    }

    async list({ userId, page, limit }: { userId: number; limit: number; page: number }): Promise<GetCartResType> {
        const skip = (page - 1) * limit;
        const take = limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.cartItem.count({
                where: { userId },
            }),
            this.prismaService.cartItem.findMany({
                where: { userId },
                include: {
                    sku: {
                        include: {
                            product: {
                                include: {
                                    productTranslations: {
                                        where: { languageId: 'vi', deletedAt: null },
                                    },
                                    createdBy: {
                                        select: {
                                            id: true,
                                            name: true,
                                            avatar: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                skip,
                take,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
        ]);
        const transformedData = data.map((item: any) => ({
            id: item.id,
            userId: item.userId,
            skuId: item.skuId,
            quantity: item.quantity,
            price: item.price,
            sku: {
                id: item.sku.id,
                value: item.sku.value,
                price: item.sku.price,
                stock: item.sku.stock,
                image: item.sku.image,
                productId: item.sku.productId,
                product: {
                    id: item.sku.product.id,
                    name: item.sku.product.name,
                    basePrice: item.sku.product.basePrice,
                    virtualPrice: item.sku.product.virtualPrice,
                    brandId: item.sku.product.brandId,
                    images: item.sku.product.images,
                    variants: item.sku.product.variants,
                    description: item.sku.product.productTranslations?.[0]?.description ?? null,
                    createdById: item.sku.product.createdById,
                },
            },
        }));

        // Group by shop (createdById)
        const groupedByShop = transformedData.reduce((acc: any, item: any) => {
            const shopId = item.sku.product.createdById;
            if (!acc[shopId]) {
                acc[shopId] = {
                    shop: item.sku.product.createdBy,
                    items: [],
                    totalItems: 0,
                    totalPrice: 0,
                };
            }
            acc[shopId].items.push(item);
            acc[shopId].totalItems += item.quantity;
            acc[shopId].totalPrice += item.price * item.quantity;
            return acc;
        }, {});

        const groupedData = Object.values(groupedByShop);
        return {
            data: groupedData as any,
            totalItems: data.length,
            limit,
            page,
            totalPages: Math.ceil(totalItems / limit),
        };
    }

    async create(userId: number, body: AddToCartBodyType): Promise<CartItemType> {
        await this.validateSKU(body.skuId, body.quantity);
        return this.prismaService.cartItem.upsert({
            where: {
                userId_skuId: {
                    userId,
                    skuId: body.skuId,
                },
            },
            update: {
                quantity: {
                    increment: body.quantity,
                },
            },
            create: {
                userId,
                skuId: body.skuId,
                quantity: body.quantity,
            },
        });
    }

    async update(cartItemId: number, body: UpdateCartItemBodyType): Promise<CartItemType> {
        await this.validateSKU(body.skuId, body.quantity);

        const result = await this.prismaService.cartItem.update({
            where: {
                id: cartItemId,
            },
            data: {
                skuId: body.skuId,
                quantity: body.quantity,
            },
        });

        // Transform to strip metadata
        return {
            id: result.id,
            userId: result.userId,
            skuId: result.skuId,
            quantity: result.quantity,
        } as any;
    }

    delete(userId: number, body: DeleteCartBodyType): Promise<{ count: number }> {
        return this.prismaService.cartItem.deleteMany({
            where: {
                id: {
                    in: body.cartItemIds,
                },
                userId,
            },
        });
    }
}
