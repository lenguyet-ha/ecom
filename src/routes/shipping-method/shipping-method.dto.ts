import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const ShippingMethodSchema = z.object({
    id: z.number(),
    name: z.string().max(200),
    provider: z.string().max(200).nullable(),
    price: z.number().min(0),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const GetShippingMethodsResSchema = z.object({
    data: z.array(ShippingMethodSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetShippingMethodsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
        isActive: z.preprocess((value) => {
            if (value === 'true') return true;
            if (value === 'false') return false;
            return undefined;
        }, z.boolean().optional()),
    })
    .strict();

export const GetShippingMethodParamsSchema = z
    .object({
        shippingMethodId: z.coerce.number().int().positive(),
    })
    .strict();

export const CreateShippingMethodBodySchema = z
    .object({
        name: z.string().trim().max(200),
        provider: z.string().trim().max(200).optional(),
        price: z.number().min(0).default(0),
        isActive: z.boolean().default(true),
    })
    .strict();

export const UpdateShippingMethodBodySchema = CreateShippingMethodBodySchema
    .partial()
    .strict();

export type ShippingMethodType = z.infer<typeof ShippingMethodSchema>;
export type GetShippingMethodsResType = z.infer<typeof GetShippingMethodsResSchema>;
export type GetShippingMethodsQueryType = z.infer<typeof GetShippingMethodsQuerySchema>;
export type CreateShippingMethodBodyType = z.infer<typeof CreateShippingMethodBodySchema>;
export type GetShippingMethodParamsType = z.infer<typeof GetShippingMethodParamsSchema>;
export type UpdateShippingMethodBodyType = z.infer<typeof UpdateShippingMethodBodySchema>;

export class GetShippingMethodsResDTO extends createZodDto(GetShippingMethodsResSchema) {}
export class GetShippingMethodsQueryDTO extends createZodDto(GetShippingMethodsQuerySchema) {}
export class GetShippingMethodParamsDTO extends createZodDto(GetShippingMethodParamsSchema) {}
export class ShippingMethodDTO extends createZodDto(ShippingMethodSchema) {}
export class CreateShippingMethodBodyDTO extends createZodDto(CreateShippingMethodBodySchema) {}
export class UpdateShippingMethodBodyDTO extends createZodDto(UpdateShippingMethodBodySchema) {}