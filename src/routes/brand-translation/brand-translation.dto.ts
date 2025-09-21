import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BrandTranslationSchema = z.object({
    id: z.number(),
    brandId: z.number(),
    languageId: z.string(),
    name: z.string().max(500),
    description: z.string(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    brand: z.object({
        id: z.number(),
        name: z.string(),
        logo: z.string(),
    }).optional(),
    language: z.object({
        id: z.string(),
        name: z.string(),
    }).optional(),
});

export const GetBrandTranslationDetailResSchema = BrandTranslationSchema;

export const GetBrandTranslationsResSchema = z.object({
    data: z.array(BrandTranslationSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetBrandTranslationsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
        limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetBrandTranslationParamsSchema = z
    .object({
        brandTranslationId: z.string().transform((val) => parseInt(val, 10)),
    })
    .strict();

export const GetBrandTranslationsByBrandParamsSchema = z
    .object({
        brandId: z.string().transform((val) => parseInt(val, 10)),
    })
    .strict();

export const CreateBrandTranslationBodySchema = BrandTranslationSchema.pick({
    brandId: true,
    languageId: true,
    name: true,
    description: true,
}).strict();

export const UpdateBrandTranslationBodySchema = BrandTranslationSchema.pick({
    name: true,
    description: true,
}).partial().strict();

export type BrandTranslationType = z.infer<typeof BrandTranslationSchema>;
export type GetBrandTranslationsResType = z.infer<typeof GetBrandTranslationsResSchema>;
export type GetBrandTranslationsQueryType = z.infer<typeof GetBrandTranslationsQuerySchema>;
export type GetBrandTranslationDetailResType = z.infer<typeof GetBrandTranslationDetailResSchema>;
export type CreateBrandTranslationBodyType = z.infer<typeof CreateBrandTranslationBodySchema>;
export type GetBrandTranslationParamsType = z.infer<typeof GetBrandTranslationParamsSchema>;
export type GetBrandTranslationsByBrandParamsType = z.infer<typeof GetBrandTranslationsByBrandParamsSchema>;
export type UpdateBrandTranslationBodyType = z.infer<typeof UpdateBrandTranslationBodySchema>;

export class GetBrandTranslationsResDTO extends createZodDto(GetBrandTranslationsResSchema) {}

export class GetBrandTranslationsQueryDTO extends createZodDto(GetBrandTranslationsQuerySchema) {}

export class GetBrandTranslationParamsDTO extends createZodDto(GetBrandTranslationParamsSchema) {}

export class GetBrandTranslationsByBrandParamsDTO extends createZodDto(GetBrandTranslationsByBrandParamsSchema) {}

export class GetBrandTranslationDetailResDTO extends createZodDto(GetBrandTranslationDetailResSchema) {}

export class CreateBrandTranslationBodyDTO extends createZodDto(CreateBrandTranslationBodySchema) {}

export class UpdateBrandTranslationBodyDTO extends createZodDto(UpdateBrandTranslationBodySchema) {}
