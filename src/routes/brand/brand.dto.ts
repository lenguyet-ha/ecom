import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const BrandSchema = z.object({
    id: z.number(),
    logo: z.string().max(1000),
    name: z.string().max(500),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
    brandTranslations: z
        .array(
            z.object({
                id: z.number(),
                brandId: z.number(),
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
});

export const GetBrandDetailResSchema = BrandSchema;

export const GetBrandsResSchema = z.object({
    data: z.array(BrandSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetBrandsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
        limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetBrandParamsSchema = z
    .object({
        brandId: z.coerce.number(),
    })
    .strict();

export const CreateBrandBodySchema = BrandSchema.pick({
    logo: true,
    name: true,
}).strict();

export const UpdateBrandBodySchema = BrandSchema.pick({
    logo: true,
    name: true,
})
    .partial()
    .strict();

export type BrandType = z.infer<typeof BrandSchema>;
export type GetBrandsResType = z.infer<typeof GetBrandsResSchema>;
export type GetBrandsQueryType = z.infer<typeof GetBrandsQuerySchema>;
export type GetBrandDetailResType = z.infer<typeof GetBrandDetailResSchema>;
export type CreateBrandBodyType = z.infer<typeof CreateBrandBodySchema>;
export type GetBrandParamsType = z.infer<typeof GetBrandParamsSchema>;
export type UpdateBrandBodyType = z.infer<typeof UpdateBrandBodySchema>;

export class GetBrandsResDTO extends createZodDto(GetBrandsResSchema) {}

export class GetBrandsQueryDTO extends createZodDto(GetBrandsQuerySchema) {}

export class GetBrandParamsDTO extends createZodDto(GetBrandParamsSchema) {}

export class GetBrandDetailResDTO extends createZodDto(GetBrandDetailResSchema) {}

export class CreateBrandBodyDTO extends createZodDto(CreateBrandBodySchema) {}

export class UpdateBrandBodyDTO extends createZodDto(UpdateBrandBodySchema) {}
