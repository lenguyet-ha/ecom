import { OrderBy, SortBy } from 'src/shared/constants/other.constant';
import z from 'zod';
import { ProductTranslationSchema } from './product-translation/product-translation.dto';
import { SKUSchema, UpsertSKUBodySchema } from './sku.model';
import { CategorySchema } from '../category/category.dto';
import { BrandSchema } from '../brand/brand.dto';
import { createZodDto } from 'nestjs-zod';

export const VariantSchema = z.object({
    value: z.string().trim(),
    options: z.array(z.string().trim()),
});

export const VariantsSchema = z.array(VariantSchema).superRefine((variants, ctx) => {
    // Kiểm tra variants và variant option có bị trùng hay không
    for (let i = 0; i < variants.length; i++) {
        const variant = variants[i];
        const isExistingVariant =
            variants.findIndex((v) => v.value.toLowerCase() === variant.value.toLowerCase()) !== i;
        if (isExistingVariant) {
            return ctx.addIssue({
                code: 'custom',
                message: `Giá trị ${variant.value} đã tồn tại trong danh sách variants. Vui lòng kiểm tra lại.`,
                path: ['variants'],
            });
        }
        const isDifferentOption = variant.options.some((option, index) => {
            const isExistingOption =
                variant.options.findIndex((o) => o.toLowerCase() === option.toLowerCase()) !== index;
            return isExistingOption;
        });
        if (isDifferentOption) {
            return ctx.addIssue({
                code: 'custom',
                message: `Variant ${variant.value} chứa các option trùng tên với nhau. Vui lòng kiểm tra lại.`,
                path: ['variants'],
            });
        }
    }
});

export const ProductSchema = z.object({
    id: z.number(),
    publishedAt: z.date().nullable(),
    name: z.string().trim().max(500),
    basePrice: z.number().min(0),
    virtualPrice: z.number().min(0),
    brandId: z.number().positive(),
    images: z.array(z.string()),
    variants: VariantsSchema, // Json field represented as a record

    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

function generateSKUs(variants: VariantsType) {
    // Hàm hỗ trợ để tạo tất cả tổ hợp
    function getCombinations(arrays: string[][]): string[] {
        return arrays.reduce((acc, curr) => acc.flatMap((x) => curr.map((y) => `${x}${x ? '-' : ''}${y}`)), ['']);
    }

    // Lấy mảng các options từ variants
    const options = variants.map((variant) => variant.options);

    // Tạo tất cả tổ hợp
    const combinations = getCombinations(options);

    // Chuyển tổ hợp thành SKU objects
    return combinations.map((value) => ({
        value,
        price: 0,
        stock: 100,
        image: '',
    }));
}

/**
 * Dành cho client và guest
 */
export const GetProductsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(10),
    name: z.string().optional(),
    brandIds: z
        .preprocess((value) => {
            if (typeof value === 'string') {
                return [Number(value)];
            }
            return value;
        }, z.array(z.coerce.number().int().positive()))
        .optional(),
    categories: z
        .preprocess((value) => {
            if (typeof value === 'string') {
                return [Number(value)];
            }
            return value;
        }, z.array(z.coerce.number().int().positive()))
        .optional(),
    minPrice: z.coerce.number().positive().optional(),
    maxPrice: z.coerce.number().positive().optional(),
    createdById: z.coerce.number().int().positive().optional(),
    orderBy: z.enum([OrderBy.Asc, OrderBy.Desc]).default(OrderBy.Desc),
    sortBy: z.enum([SortBy.CreatedAt, SortBy.Price, SortBy.Sale]).default(SortBy.CreatedAt),
    isPublished: z.preprocess((value) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return undefined;
    }, z.boolean().optional()),
});

/**
 * Dành cho Admin và Seller
 */
export const GetManageProductsQuerySchema = GetProductsQuerySchema.extend({
    isPublic: z.preprocess((value) => value === 'true', z.boolean()).optional(),
    createdById: z.coerce.number().int().positive(),
});
export const GetProductsResSchema = z.object({
    data: z.array(ProductSchema),
    totalItems: z.number(),
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetProductParamsSchema = z
    .object({
        productId: z.coerce.number().int().positive(),
    })
    .strict();

export const GetProductDetailResSchema = ProductSchema.extend({
    productTranslations: z.array(ProductTranslationSchema),
    skus: z.array(SKUSchema),
    categories: z.array(CategorySchema),
    brand: BrandSchema,
});

export const CreateProductBodySchema = z
    .object({
        publishedAt: z.preprocess((val) => (val ? new Date(val as string) : null), z.date().nullable()),
        name: z.string().trim().max(500),
        basePrice: z.number().min(0),
        virtualPrice: z.number().min(0),
        brandId: z.number().positive(),
        images: z.array(z.string()),
        variants: VariantsSchema,
        categories: z.array(z.coerce.number().int().positive()),
        skus: z.array(UpsertSKUBodySchema),
    })
    .strict()
    .superRefine(({ variants, skus }, ctx) => {
        // Kiểm tra xem số lượng SKU có hợp lệ hay không
        const skuValueArray = generateSKUs(variants);
        if (skus.length !== skuValueArray.length) {
            return ctx.addIssue({
                code: 'custom',
                path: ['skus'],
                message: `Số lượng SKU nên là ${skuValueArray.length}. Vui lòng kiểm tra lại.`,
            });
        }

        // Kiểm tra từng SKU có hợp lệ hay không
        let wrongSKUIndex = -1;
        const isValidSKUs = skus.every((sku, index) => {
            const isValid = sku.value === skuValueArray[index].value;
            if (!isValid) {
                wrongSKUIndex = index;
            }
            return isValid;
        });
        if (!isValidSKUs) {
            ctx.addIssue({
                code: 'custom',
                path: ['skus'],
                message: `Giá trị SKU index ${wrongSKUIndex} không hợp lệ. Vui lòng kiểm tra lại.`,
            });
        }
    });

export type ProductType = z.infer<typeof ProductSchema>;
export type VariantsType = z.infer<typeof VariantsSchema>;

export const UpdateProductBodySchema = CreateProductBodySchema;

export type GetProductsResType = z.infer<typeof GetProductsResSchema>;
export type GetProductsQueryType = z.infer<typeof GetProductsQuerySchema>;
export type GetManageProductsQueryType = z.infer<typeof GetManageProductsQuerySchema>;
export type GetProductDetailResType = z.infer<typeof GetProductDetailResSchema>;
export type CreateProductBodyType = z.infer<typeof CreateProductBodySchema>;
export type GetProductParamsType = z.infer<typeof GetProductParamsSchema>;
export type UpdateProductBodyType = z.infer<typeof UpdateProductBodySchema>;

export class ProductDTO extends createZodDto(ProductSchema) {}

export class GetProductsResDTO extends createZodDto(GetProductsResSchema) {}

export class GetProductsQueryDTO extends createZodDto(GetProductsQuerySchema) {}

export class GetManageProductsQueryDTO extends createZodDto(GetManageProductsQuerySchema) {}

export class GetProductParamsDTO extends createZodDto(GetProductParamsSchema) {}

export class GetProductDetailResDTO extends createZodDto(GetProductDetailResSchema) {}

export class CreateProductBodyDTO extends createZodDto(CreateProductBodySchema) {}

export class UpdateProductBodyDTO extends createZodDto(UpdateProductBodySchema) {}
