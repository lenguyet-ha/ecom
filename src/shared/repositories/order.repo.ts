import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import {
    CancelOrderResType,
    CreateOrderBodyType,
    CreateOrderResType,
    GetOrderDetailResType,
    GetOrderListQueryType,
    GetOrderListResDTO,
    GetOrderListResType,
} from 'src/routes/order/order.dto';
import {
    CannotCancelOrderException,
    NotFoundCartItemException,
    OrderNotFoundException,
    OutOfStockSKUException,
    ProductNotFoundException,
    SKUNotBelongToShopException,
} from 'src/routes/order/order.error';

import { PrismaService } from 'src/shared/services/prisma.service';
import { OrderStatus, OrderStatusType, PaymentStatus } from '../constants/order.constant';
import { isNotFoundPrismaError } from '../helpers';
import { OrderProducer } from 'src/routes/order/order.producer';
import type { TokenPayload } from '../types/jwt.type';

@Injectable()
export class OrderRepo {
    constructor(
        private readonly prismaService: PrismaService,
      //  private orderProducer: OrderProducer,
    ) {}
    async list(user: TokenPayload, query: GetOrderListQueryType): Promise<any> {
        const { page, limit, status, shopId } = query;
        const skip = (page - 1) * limit;
        const take = limit;
        
        // Nếu là admin thì lấy tất cả đơn hàng, nếu không thì chỉ lấy đơn của user
        const where: Prisma.OrderWhereInput = {
            ...(user.roleName !== 'ADMIN' && { userId: user.userId }),
            ...(status && { status }),
            ...(shopId && { shopId }),
        };

        // Đếm tổng số order
        const totalItem$ = this.prismaService.order.count({
            where,
        });
        // Lấy list order
        const data$ = this.prismaService.order.findMany({
            where,
            select: {
                id: true,
                userId: true,
                status: true,
                shopId: true,
                createdAt: true,
                // Financial fields
                subtotal: true,
                discountAmount: true,
                total: true,
                commissionRate: true,
                adminCommissionAmount: true,
                shopPayoutAmount: true,
                payoutStatus: true,
                // Relations
                shop: {
                    select: {
                        name: true,
                    },
                },
                paymentMethod: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                    },
                },
                shippingMethod: {
                    select: {
                        id: true,
                        name: true,
                        provider: true,
                        price: true,
                    },
                },
                discountCode: {
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        bearer: true,
                    },
                },
                items: {
                    select: {
                        id: true,
                        productId: true,
                        productName: true,
                        productTranslations: true,
                        skuPrice: true,
                        image: true,
                        skuValue: true,
                        skuId: true,
                        orderId: true,
                        quantity: true,
                        createdAt: true,
                    },
                },
            },
            skip,
            take,
            orderBy: { createdAt: 'desc' },
        });
        const [data, totalItems] = await Promise.all([data$, totalItem$]);
        const transformedData = data.map((item) => ({
            id: item.id,
            userId: item.userId,
            status: item.status,
            shopId: item.shopId,
            shopName: item.shop?.name ?? null,
            // Financial information
            subtotal: item.subtotal,
            discountAmount: item.discountAmount,
            total: item.total,
            commissionRate: item.commissionRate,
            adminCommissionAmount: item.adminCommissionAmount,
            shopPayoutAmount: item.shopPayoutAmount,
            payoutStatus: item.payoutStatus,
            // Method relations
            paymentMethodId: item.paymentMethod?.id ?? null,
            paymentMethod: item.paymentMethod,
            shippingMethodId: item.shippingMethod?.id ?? null,
            shippingMethod: item.shippingMethod,
            discountCodeId: item.discountCode?.id ?? null,
            discountCode: item.discountCode,
            // Items and timestamp
            items: item.items,
            createdAt: item.createdAt,
        }));
        return {
            data: transformedData,
            page,
            limit,
            totalItems,
            totalPages: Math.ceil(totalItems / limit),
        };
    }
    async create(userId: number, body: CreateOrderBodyType): Promise<any> {
        // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
        // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
        // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
        // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
        // 5. Validate discount codes, shipping methods, payment methods
        // 6. Tạo order
        // 7. Xóa cartItem
        const allBodyCartItemIds = body.map((item) => item.cartItemIds).flat();
        
        // Get all IDs to validate
        const discountCodeIds = body.map((item) => item.discountCodeId).filter((id): id is number => id !== undefined);
        const shippingMethodIds = body.map((item) => item.shippingMethodId).filter((id): id is number => id !== undefined);
        const paymentMethodIds = body.map((item) => item.paymentMethodId).filter((id): id is number => id !== undefined);

        const [cartItems, discountCodes, shippingMethods, paymentMethods] = await Promise.all([
            this.prismaService.cartItem.findMany({
                where: {
                    id: {
                        in: allBodyCartItemIds,
                    },
                    userId,
                },
                include: {
                    sku: {
                        include: {
                            product: {
                                include: {
                                    productTranslations: true,
                                },
                            },
                        },
                    },
                },
            }),
            discountCodeIds.length > 0
                ? this.prismaService.discountCode.findMany({
                      where: {
                          id: { in: discountCodeIds },
                          isActive: true,
                      },
                  })
                : Promise.resolve([]),
            shippingMethodIds.length > 0
                ? this.prismaService.shippingMethod.findMany({
                      where: {
                          id: { in: shippingMethodIds },
                          isActive: true,
                      },
                  })
                : Promise.resolve([]),
            paymentMethodIds.length > 0
                ? this.prismaService.paymentMethod.findMany({
                      where: {
                          id: { in: paymentMethodIds },
                          isActive: true,
                      },
                  })
                : Promise.resolve([]),
        ]);
        // 1. Kiểm tra xem tất cả cartItemIds có tồn tại trong cơ sở dữ liệu hay không
        if (cartItems.length !== allBodyCartItemIds.length) {
            throw NotFoundCartItemException;
        }

        // 2. Kiểm tra số lượng mua có lớn hơn số lượng tồn kho hay không
        const isOutOfStock = cartItems.some((item) => {
            return item.sku.stock < item.quantity;
        });
        if (isOutOfStock) {
            throw OutOfStockSKUException;
        }

        // 3. Kiểm tra xem tất cả sản phẩm mua có sản phẩm nào bị xóa hay ẩn không
        const isExistNotReadyProduct = cartItems.some(
            (item) =>
                item.sku.product.deletedAt !== null ||
                item.sku.product.publishedAt === null ||
                item.sku.product.publishedAt > new Date(),
        );
        if (isExistNotReadyProduct) {
            throw ProductNotFoundException;
        }

        // 4. Kiểm tra xem các skuId trong cartItem gửi lên có thuộc về shopid gửi lên không
        const cartItemMap = new Map<number, (typeof cartItems)[0]>();
        cartItems.forEach((item) => {
            cartItemMap.set(item.id, item);
        });
        // const isValidShop = body.every((item) => {
        //     const bodyCartItemIds = item.cartItemIds;
        //     return bodyCartItemIds.every((cartItemId) => {
        //         // Neu đã đến bước này thì cartItem luôn luôn có giá trị
        //         // Vì chúng ta đã so sánh với allBodyCartItems.length ở trên rồi
        //         const cartItem = cartItemMap.get(cartItemId)!;
        //         return item.shopId === cartItem.sku.createdById;
        //     });
        // });
        // if (!isValidShop) {
        //     throw SKUNotBelongToShopException;
        // }

        // 5. Tạo order và xóa cartItem trong transaction để đảm bảo tính toàn vẹn dữ liệu
        const [paymentId, orders] = await this.prismaService.$transaction(async (tx) => {
            const payment = await tx.payment.create({
                data: {
                    status: PaymentStatus.PENDING,
                },
            });
            const orders$ = Promise.all(
                body.map((item) => {
                    // Calculate commission (8% of subtotal - discountAmount)
                    const commissionRate = 8.0; // Default commission rate
                    const discountableAmount = item.subtotal - item.discountAmount;
                    const adminCommissionAmount = discountableAmount * (commissionRate / 100);
                    const shopPayoutAmount = discountableAmount - adminCommissionAmount;

                    return tx.order.create({
                        data: {
                            userId,
                            status: OrderStatus.PENDING_PAYMENT,
                            receiver: item.receiver,
                            createdById: userId,
                            shopId: item.shopId,
                            paymentId: payment.id,
                            // Financial fields
                            subtotal: item.subtotal,
                            discountAmount: item.discountAmount,
                            total: item.total,
                            commissionRate,
                            adminCommissionAmount,
                            shopPayoutAmount,
                            payoutStatus: 'PENDING',
                            // Relations
                            discountCodeId: item.discountCodeId,
                            shippingMethodId: item.shippingMethodId,
                            paymentMethodId: item.paymentMethodId,
                            items: {
                                create: item.cartItemIds.map((cartItemId) => {
                                    const cartItem = cartItemMap.get(cartItemId)!;
                                    return {
                                        productName: cartItem.sku.product.name,
                                        skuPrice: cartItem.sku.price,
                                        image: cartItem.sku.image,
                                        skuId: cartItem.sku.id,
                                        skuValue: cartItem.sku.value,
                                        quantity: cartItem.quantity,
                                        productId: cartItem.sku.product.id,
                                        productTranslations: cartItem.sku.product.productTranslations.map(
                                            (translation) => {
                                                return {
                                                    id: translation.id,
                                                    name: translation.name,
                                                    description: translation.description,
                                                    languageId: translation.languageId,
                                                };
                                            },
                                        ),
                                    };
                                }),
                            },
                            products: {
                                connect: item.cartItemIds.map((cartItemId) => {
                                    const cartItem = cartItemMap.get(cartItemId)!;
                                    return {
                                        id: cartItem.sku.product.id,
                                    };
                                }),
                            },
                        },
                    });
                }),
            );
            const cartItem$ = tx.cartItem.deleteMany({
                where: {
                    id: {
                        in: allBodyCartItemIds,
                    },
                },
            });
            const sku$ = Promise.all(
                cartItems.map((item) =>
                    tx.sKU.update({
                        where: {
                            id: item.sku.id,
                        },
                        data: {
                            stock: {
                                decrement: item.quantity,
                            },
                        },
                    }),
                ),
            );
       //     const addCancelPaymentJob$ = this.orderProducer.addCancelPaymentJob(payment.id);
            const [orders] = await Promise.all([orders$, cartItem$, sku$]);
            return [payment.id, orders];
        });
        return {
            orders,
        };
    }

    async detail(user: TokenPayload, orderid: number): Promise<any> {
        // Nếu là admin thì xem được tất cả đơn, nếu không thì chỉ xem đơn của mình
        const where: Prisma.OrderWhereInput = {
            id: orderid,
            ...(user.roleName !== 'ADMIN' && { userId: user.userId }),
            deletedAt: null,
        };

        const order = await this.prismaService.order.findFirst({
            where,
            include: {
                items: true,
                shop: {
                    select: {
                        name: true,
                    },
                },
                paymentMethod: {
                    select: {
                        id: true,
                        key: true,
                        name: true,
                    },
                },
                shippingMethod: {
                    select: {
                        id: true,
                        name: true,
                        provider: true,
                        price: true,
                    },
                },
                discountCode: {
                    select: {
                        id: true,
                        code: true,
                        type: true,
                        value: true,
                        bearer: true,
                    },
                },
            },
        });
        if (!order) {
            throw OrderNotFoundException;
        }
        return {
            id: order.id,
            userId: order.userId,
            status: order.status,
            receiver: order.receiver,
            shopId: order.shopId,
            shopName: order.shop?.name ?? null,
            // Financial information
            subtotal: order.subtotal,
            discountAmount: order.discountAmount,
            total: order.total,
            commissionRate: order.commissionRate,
            adminCommissionAmount: order.adminCommissionAmount,
            shopPayoutAmount: order.shopPayoutAmount,
            payoutStatus: order.payoutStatus,
            // Method relations
            paymentMethodId: order.paymentMethodId,
            paymentMethod: order.paymentMethod,
            shippingMethodId: order.shippingMethodId,
            shippingMethod: order.shippingMethod,
            discountCodeId: order.discountCodeId,
            discountCode: order.discountCode,
            // Items and metadata
            items: order.items,
            createdById: order.createdById,
            updatedById: order.updatedById,
            deletedById: order.deletedById,
            deletedAt: order.deletedAt,
            createdAt: order.createdAt,
            updatedAt: order.updatedAt,
        };
    }

    async cancel(userId: number, orderId: number): Promise<any> {
        try {
            const order = await this.prismaService.order.findUniqueOrThrow({
                where: {
                    id: orderId,
                    userId,
                    deletedAt: null,
                },
            });
            if (order.status !== OrderStatus.PENDING_PAYMENT) {
                throw CannotCancelOrderException;
            }
            const updatedOrder = await this.prismaService.order.update({
                where: {
                    id: orderId,
                    userId,
                    deletedAt: null,
                },
                data: {
                    status: OrderStatus.CANCELLED,
                    updatedById: userId,
                },
            });
            return updatedOrder;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw OrderNotFoundException;
            }
            throw error;
        }
    }

    async updateStatus(orderId: number, status: OrderStatusType, userId: number): Promise<any> {
        try {
            const order = await this.prismaService.order.findUniqueOrThrow({
                where: {
                    id: orderId,
                    deletedAt: null,
                },
            });

            const updatedOrder = await this.prismaService.order.update({
                where: {
                    id: orderId,
                    deletedAt: null,
                },
                data: {
                    status,
                    updatedById: userId,
                },
            });

            return updatedOrder;
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw OrderNotFoundException;
            }
            throw error;
        }
    }
}
