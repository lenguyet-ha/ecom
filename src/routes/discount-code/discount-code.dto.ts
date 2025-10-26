import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const DiscountCodeSchema = z.object({
    id: z.number(),
    code: z.string().max(100),
    type: z.enum(['PERCENTAGE', 'FIXED']),
    value: z.number().min(0),
    bearer: z.enum(['ADMIN', 'SHOP']),
    shopId: z.number().nullable(),
    usageLimit: z.number().nullable(),
    usedCount: z.number(),
    validFrom: z.date().nullable(),
    validTo: z.date().nullable(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    shop: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
    }).nullable().optional(),
    createdBy: z.object({
        id: z.number(),
        name: z.string(),
        email: z.string(),
    }).nullable().optional(),
});

export const GetDiscountCodesResSchema = z.object({
    data: z.array(DiscountCodeSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetDiscountCodesQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
        isActive: z.preprocess((value) => {
            if (value === 'true') return true;
            if (value === 'false') return false;
            return undefined;
        }, z.boolean().optional()),
        bearer: z.enum(['ADMIN', 'SHOP']).optional(),
        shopId: z.coerce.number().int().positive().optional(),
    })
    .strict();

export const GetDiscountCodeParamsSchema = z
    .object({
        discountCodeId: z.coerce.number().int().positive(),
    })
    .strict();

export const CreateDiscountCodeBodySchema = z
    .object({
        code: z.string().trim().max(100),
        type: z.enum(['PERCENTAGE', 'FIXED']),
        value: z.number().min(0),
        bearer: z.enum(['ADMIN', 'SHOP']),
        shopId: z.number().positive().nullable(),
        usageLimit: z.number().positive().optional(),
        validFrom: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable().optional()),
        validTo: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable().optional()),
        isActive: z.boolean().default(true),
    })
    .strict()
    .superRefine((data, ctx) => {
        if (data.bearer === 'SHOP' && data.shopId === null) {
            ctx.addIssue({
                code: 'custom',
                message: 'shopId is required when bearer is SHOP',
                path: ['shopId'],
            });
        }
        if (data.type === 'PERCENTAGE' && data.value > 100) {
            ctx.addIssue({
                code: 'custom',
                message: 'Percentage value cannot exceed 100',
                path: ['value'],
            });
        }
        if (data.validFrom && data.validTo && data.validFrom >= data.validTo) {
            ctx.addIssue({
                code: 'custom',
                message: 'validFrom must be earlier than validTo',
                path: ['validTo'],
            });
        }
    });

export const UpdateDiscountCodeBodySchema = CreateDiscountCodeBodySchema
    .partial()
    .strict();

export type DiscountCodeType = z.infer<typeof DiscountCodeSchema>;
export type GetDiscountCodesResType = z.infer<typeof GetDiscountCodesResSchema>;
export type GetDiscountCodesQueryType = z.infer<typeof GetDiscountCodesQuerySchema>;
export type CreateDiscountCodeBodyType = z.infer<typeof CreateDiscountCodeBodySchema>;
export type GetDiscountCodeParamsType = z.infer<typeof GetDiscountCodeParamsSchema>;
export type UpdateDiscountCodeBodyType = z.infer<typeof UpdateDiscountCodeBodySchema>;

export class GetDiscountCodesResDTO extends createZodDto(GetDiscountCodesResSchema) {}
export class GetDiscountCodesQueryDTO extends createZodDto(GetDiscountCodesQuerySchema) {}
export class GetDiscountCodeParamsDTO extends createZodDto(GetDiscountCodeParamsSchema) {}
export class DiscountCodeDTO extends createZodDto(DiscountCodeSchema) {}
export class CreateDiscountCodeBodyDTO extends createZodDto(CreateDiscountCodeBodySchema) {}
export class UpdateDiscountCodeBodyDTO extends createZodDto(UpdateDiscountCodeBodySchema) {}