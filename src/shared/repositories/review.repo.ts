import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    CreateReviewBodyType,
    CreateReviewResType,
    GetReviewsByOrderResType,
    GetReviewsByProductQueryType,
    GetReviewsResType,
    ReviewDetailType,
    UpdateReviewBodyType,
} from 'src/routes/review/review.dto';
import {
    MaxUpdateReviewExceededException,
    OrderNotDeliveredException,
    OrderNotFoundException,
    ProductNotInOrderException,
    ReviewAlreadyExistsException,
    ReviewNotFoundException,
    UnauthorizedReviewAccessException,
} from 'src/routes/review/review.error';
import { OrderStatus } from 'src/shared/constants/order.constant';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReviewRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async create(userId: number, body: CreateReviewBodyType): Promise<CreateReviewResType> {
        // 1. Kiểm tra order có tồn tại và thuộc về user không
        const order = await this.prismaService.order.findUnique({
            where: {
                id: body.orderId,
                userId,
            },
            include: {
                items: true,
            },
        });

        if (!order) {
            throw OrderNotFoundException;
        }

        // 2. Kiểm tra order đã được giao hàng chưa
        if (order.status !== OrderStatus.DELIVERED) {
            throw OrderNotDeliveredException;
        }

        // 3. Kiểm tra các productId có trong order không
        const orderProductIds = order.items.map((item) => item.productId).filter((id) => id !== null);
        const reviewProductIds = body.reviews.map((review) => review.productId);

        const invalidProducts = reviewProductIds.filter((id) => !orderProductIds.includes(id));
        if (invalidProducts.length > 0) {
            throw ProductNotInOrderException;
        }

        // 4. Kiểm tra đã review chưa
        const existingReviews = await this.prismaService.review.findMany({
            where: {
                orderId: body.orderId,
                productId: {
                    in: reviewProductIds,
                },
            },
        });

        if (existingReviews.length > 0) {
            throw ReviewAlreadyExistsException;
        }

        // 5. Tạo reviews trong transaction
        const reviews = await this.prismaService.$transaction(
            body.reviews.map((review) =>
                this.prismaService.review.create({
                    data: {
                        content: review.content,
                        rating: review.rating,
                        orderId: body.orderId,
                        productId: review.productId,
                        userId,
                        medias: {
                            create: review.mediaUrls.map((url) => ({
                                url,
                                type: 'IMAGE',
                            })),
                        },
                    },
                    include: {
                        medias: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                avatar: true,
                            },
                        },
                    },
                }),
            ),
        );

        return {
            message: 'Reviews created successfully',
            data: reviews as any,
        };
    }

    async getByProduct(query: GetReviewsByProductQueryType): Promise<GetReviewsResType> {
        const { productId, page, limit, rating } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ReviewWhereInput = {
            productId,
            ...(rating && { rating }),
        };

        const [reviews, totalItems, allReviews] = await Promise.all([
            this.prismaService.review.findMany({
                where,
                include: {
                    medias: true,
                    user: {
                        select: {
                            id: true,
                            name: true,
                            avatar: true,
                        },
                    },
                },
                skip,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prismaService.review.count({ where }),
            this.prismaService.review.findMany({
                where: { productId },
                select: { rating: true },
            }),
        ]);

        // Tính average rating và distribution
        const totalRating = allReviews.reduce((sum, review) => sum + review.rating, 0);
        const averageRating = allReviews.length > 0 ? totalRating / allReviews.length : 0;

        const ratingDistribution = {
            1: allReviews.filter((r) => r.rating === 1).length,
            2: allReviews.filter((r) => r.rating === 2).length,
            3: allReviews.filter((r) => r.rating === 3).length,
            4: allReviews.filter((r) => r.rating === 4).length,
            5: allReviews.filter((r) => r.rating === 5).length,
        };

        return {
            data: reviews as any,
            totalItems,
            page,
            limit,
            totalPages: Math.ceil(totalItems / limit),
            averageRating: Math.round(averageRating * 10) / 10,
            ratingDistribution,
        };
    }

    async getByOrder(orderId: number): Promise<GetReviewsByOrderResType> {
        const reviews = await this.prismaService.review.findMany({
            where: {
                orderId,
            },
            include: {
                medias: true,
                user: {
                    select: {
                        id: true,
                        name: true,
                        avatar: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return {
            data: reviews as any,
        };
    }
}
