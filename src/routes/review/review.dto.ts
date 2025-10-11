import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const ReviewMediaSchema = z.object({
    id: z.number(),
    url: z.string(),
    type: z.enum(['IMAGE', 'VIDEO']),
    reviewId: z.number(),
    createdAt: z.date(),
});

export const ReviewSchema = z.object({
    id: z.number(),
    content: z.string(),
    rating: z.number().int().min(1).max(5),
    orderId: z.number(),
    productId: z.number(),
    userId: z.number(),
    updateCount: z.number(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

// Schema cho từng review item trong body
export const CreateReviewItemSchema = z.object({
    productId: z.number().int().positive(),
    content: z.string().trim().min(1).max(5000),
    rating: z.number().int().min(1).max(5),
    mediaUrls: z.array(z.string().url()).max(10).optional().default([]),
});

// Schema cho body tạo review (mảng các review)
export const CreateReviewBodySchema = z.object({
    orderId: z.number().int().positive(),
    reviews: z.array(CreateReviewItemSchema).min(1),
});

// Schema cho update review
export const UpdateReviewBodySchema = z.object({
    content: z.string().trim().min(1).max(5000).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    mediaUrls: z.array(z.string().url()).max(10).optional(),
});

// Schema cho get review params
export const GetReviewParamsSchema = z.object({
    reviewId: z.coerce.number().int().positive(),
});

// Schema cho get reviews by product
export const GetReviewsByProductQuerySchema = z.object({
    productId: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    rating: z.coerce.number().int().min(1).max(5).optional(),
});

// Schema cho get reviews by order
export const GetReviewsByOrderQuerySchema = z.object({
    orderId: z.coerce.number().int().positive(),
});

// Schema cho response
export const ReviewDetailSchema = ReviewSchema.extend({
    medias: z.array(ReviewMediaSchema),
    user: z.object({
        id: z.number(),
        name: z.string(),
        avatar: z.string().nullable(),
    }),
});

export const GetReviewsResSchema = z.object({
    data: z.array(ReviewDetailSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
    averageRating: z.number(),
    ratingDistribution: z.object({
        1: z.number(),
        2: z.number(),
        3: z.number(),
        4: z.number(),
        5: z.number(),
    }),
});

export const CreateReviewResSchema = z.object({
    message: z.string(),
    data: z.array(ReviewDetailSchema),
});

// Schema cho response get reviews by order
export const GetReviewsByOrderResSchema = z.object({
    data: z.array(ReviewDetailSchema),
});

// Types
export type ReviewType = z.infer<typeof ReviewSchema>;
export type ReviewMediaType = z.infer<typeof ReviewMediaSchema>;
export type CreateReviewItemType = z.infer<typeof CreateReviewItemSchema>;
export type CreateReviewBodyType = z.infer<typeof CreateReviewBodySchema>;
export type UpdateReviewBodyType = z.infer<typeof UpdateReviewBodySchema>;
export type GetReviewParamsType = z.infer<typeof GetReviewParamsSchema>;
export type GetReviewsByProductQueryType = z.infer<typeof GetReviewsByProductQuerySchema>;
export type GetReviewsByOrderQueryType = z.infer<typeof GetReviewsByOrderQuerySchema>;
export type GetReviewsByOrderResType = z.infer<typeof GetReviewsByOrderResSchema>;
export type ReviewDetailType = z.infer<typeof ReviewDetailSchema>;
export type GetReviewsResType = z.infer<typeof GetReviewsResSchema>;
export type CreateReviewResType = z.infer<typeof CreateReviewResSchema>;

// DTOs
export class CreateReviewBodyDTO extends createZodDto(CreateReviewBodySchema) {}
export class UpdateReviewBodyDTO extends createZodDto(UpdateReviewBodySchema) {}
export class GetReviewParamsDTO extends createZodDto(GetReviewParamsSchema) {}
export class GetReviewsByProductQueryDTO extends createZodDto(GetReviewsByProductQuerySchema) {}
export class GetReviewsByOrderQueryDTO extends createZodDto(GetReviewsByOrderQuerySchema) {}
export class GetReviewsByOrderResDTO extends createZodDto(GetReviewsByOrderResSchema) {}
export class ReviewDetailDTO extends createZodDto(ReviewDetailSchema) {}
export class GetReviewsResDTO extends createZodDto(GetReviewsResSchema) {}
export class CreateReviewResDTO extends createZodDto(CreateReviewResSchema) {}
