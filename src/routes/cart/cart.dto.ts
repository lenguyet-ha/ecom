import z from 'zod';
import { SKUSchema } from '../product/sku.model';
import { ProductSchema } from '../product/product.dto';
import { ProductTranslationSchema } from '../product/product-translation/product-translation.dto';
import { createZodDto } from 'nestjs-zod';

export const CartItemSchema = z.object({
    id: z.number(),
    quantity: z.number().int().positive(),
    skuId: z.number(),
    userId: z.number(),

    createdAt: z.date(),
    updatedAt: z.date(),
});

export const GetCartItemParamsSchema = z.object({
    cartItemId: z.coerce.number(),
});

export const CartItemDetailSchema = CartItemSchema.extend({
    sku: SKUSchema.extend({
        product: ProductSchema.extend({
            productTranslation: z.array(ProductTranslationSchema),
        }),
    }),
});

export const GetCartResSchema = z.object({
    data: z.array(CartItemDetailSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const AddToCartBodySchema = CartItemSchema.pick({
    quantity: true,
    skuId: true,
}).strict();

export const UpdateCartItemBodySchema = AddToCartBodySchema;

export const DeleteCartBodySchema = z
    .object({
        cartItemIds: z.array(z.number().int().positive()),
    })
    .strict();

export type CartItemType = z.infer<typeof CartItemSchema>;
export type GetCartItemParamType = z.infer<typeof GetCartItemParamsSchema>;
export type CartItemDetailType = z.infer<typeof CartItemDetailSchema>;
export type GetCartResType = z.infer<typeof GetCartResSchema>;
export type AddToCartBodyType = z.infer<typeof AddToCartBodySchema>;
export type UpdateCartItemBodyType = z.infer<typeof UpdateCartItemBodySchema>;
export type DeleteCartBodyType = z.infer<typeof DeleteCartBodySchema>;

export class CartItemDTO extends createZodDto(CartItemSchema) {}

export class GetCartResDTO extends createZodDto(GetCartResSchema) {}

export class GetCartItemParamsDTO extends createZodDto(GetCartItemParamsSchema) {}
export class AddToCartBodyDTO extends createZodDto(AddToCartBodySchema) {}

export class UpdateCartItemBodyDTO extends createZodDto(UpdateCartItemBodySchema) {}

export class DeleteCartBodyDTO extends createZodDto(DeleteCartBodySchema) {}
