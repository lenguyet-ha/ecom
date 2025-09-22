import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CategoryTranslationSchema = z.object({
    id: z.number(),
    categoryId: z.number(),
    languageId: z.string(),
    name: z.string().max(500),
    description: z.string(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    category: z
        .object({
            id: z.number(),
            name: z.string(),
            logo: z.string().nullable(),
        })
        .optional(),
    language: z
        .object({
            id: z.string(),
            name: z.string(),
        })
        .optional(),
});

export const GetCategoryTranslationDetailResSchema = CategoryTranslationSchema;

export const GetCategoryTranslationsResSchema = z.object({
    data: z.array(CategoryTranslationSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetCategoryTranslationsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
        limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetCategoryTranslationParamsSchema = z
    .object({
        categoryTranslationId: z.coerce.number(),
    })
    .strict();

export const GetCategoryTranslationsByCategoryParamsSchema = z
    .object({
        categoryId: z.coerce.number(),
    })
    .strict();

export const CreateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
    categoryId: true,
    languageId: true,
    name: true,
    description: true,
}).strict();

export const UpdateCategoryTranslationBodySchema = CategoryTranslationSchema.pick({
    name: true,
    description: true,
})
    .partial()
    .strict();

export type CategoryTranslationType = z.infer<typeof CategoryTranslationSchema>;
export type GetCategoryTranslationsResType = z.infer<typeof GetCategoryTranslationsResSchema>;
export type GetCategoryTranslationsQueryType = z.infer<typeof GetCategoryTranslationsQuerySchema>;
export type GetCategoryTranslationDetailResType = z.infer<typeof GetCategoryTranslationDetailResSchema>;
export type CreateCategoryTranslationBodyType = z.infer<typeof CreateCategoryTranslationBodySchema>;
export type GetCategoryTranslationParamsType = z.infer<typeof GetCategoryTranslationParamsSchema>;
export type GetCategoryTranslationsByCategoryParamsType = z.infer<typeof GetCategoryTranslationsByCategoryParamsSchema>;
export type UpdateCategoryTranslationBodyType = z.infer<typeof UpdateCategoryTranslationBodySchema>;

export class GetCategoryTranslationsResDTO extends createZodDto(GetCategoryTranslationsResSchema) {}

export class GetCategoryTranslationsQueryDTO extends createZodDto(GetCategoryTranslationsQuerySchema) {}

export class GetCategoryTranslationParamsDTO extends createZodDto(GetCategoryTranslationParamsSchema) {}

export class GetCategoryTranslationsByCategoryParamsDTO extends createZodDto(GetCategoryTranslationsByCategoryParamsSchema) {}

export class GetCategoryTranslationDetailResDTO extends createZodDto(GetCategoryTranslationDetailResSchema) {}

export class CreateCategoryTranslationBodyDTO extends createZodDto(CreateCategoryTranslationBodySchema) {}

export class UpdateCategoryTranslationBodyDTO extends createZodDto(UpdateCategoryTranslationBodySchema) {}
