import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const CategorySchema = z.object({
    id: z.number(),
    logo: z.string().max(1000).nullable(),
    name: z.string().max(500),
    parentCategoryId: z.number().nullable(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    categoryTranslations: z
        .array(
            z.object({
                id: z.number(),
                categoryId: z.number(),
                languageId: z.string(),
                name: z.string().max(500),
                description: z.string(),
                language: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
                deletedAt: z.date().nullable(),
                createdAt: z.date(),
                updatedAt: z.date(),
            }),
        )
        .optional(),
    parentCategory: z
        .object({
            id: z.number(),
            name: z.string(),
            logo: z.string().nullable(),
        })
        .nullable(),
    childrenCategories: z
        .array(
            z.object({
                id: z.number(),
                name: z.string(),
                logo: z.string().nullable(),
            }),
        )
        .optional(),
});

export const GetCategoryDetailResSchema = z.object({
    id: z.number(),
    logo: z.string().max(1000).nullable(),
    name: z.string().max(500),
    parentCategoryId: z.number().nullable(),
    categoryTranslations: z
        .array(
            z.object({
                id: z.number(),
                categoryId: z.number(),
                languageId: z.string(),
                name: z.string().max(500),
                description: z.string(),
                language: z.object({
                    id: z.string(),
                    name: z.string(),
                }),
            }),
        )
        .optional(),
    parentCategory: z
        .object({
            id: z.number(),
            name: z.string(),
            logo: z.string().nullable(),
        })
        .nullable(),
    childrenCategories: z
        .array(
            z.object({
                id: z.number(),
                name: z.string(),
                logo: z.string().nullable(),
            }),
        )
        .optional(),
});

export const GetCategoriesResSchema = z.object({
    data: z.array(GetCategoryDetailResSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetCategoriesQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
        limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetCategoryParamsSchema = z
    .object({
        categoryId: z.coerce.number(),
    })
    .strict();

export const CreateCategoryBodySchema = CategorySchema.pick({
    logo: true,
    name: true,
    parentCategoryId: true,
}).strict();

export const UpdateCategoryBodySchema = CategorySchema.pick({
    logo: true,
    name: true,
    parentCategoryId: true,
})
    .partial()
    .strict();

export type CategoryType = z.infer<typeof CategorySchema>;
export type GetCategoriesResType = z.infer<typeof GetCategoriesResSchema>;
export type GetCategoriesQueryType = z.infer<typeof GetCategoriesQuerySchema>;
export type GetCategoryDetailResType = z.infer<typeof GetCategoryDetailResSchema>;
export type CreateCategoryBodyType = z.infer<typeof CreateCategoryBodySchema>;
export type GetCategoryParamsType = z.infer<typeof GetCategoryParamsSchema>;
export type UpdateCategoryBodyType = z.infer<typeof UpdateCategoryBodySchema>;

export class GetCategoriesResDTO extends createZodDto(GetCategoriesResSchema) {}

export class GetCategoriesQueryDTO extends createZodDto(GetCategoriesQuerySchema) {}

export class GetCategoryParamsDTO extends createZodDto(GetCategoryParamsSchema) {}

export class GetCategoryDetailResDTO extends createZodDto(GetCategoryDetailResSchema) {}

export class CreateCategoryBodyDTO extends createZodDto(CreateCategoryBodySchema) {}

export class UpdateCategoryBodyDTO extends createZodDto(UpdateCategoryBodySchema) {}
