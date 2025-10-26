import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const PaymentMethodSchema = z.object({
    id: z.number(),
    key: z.string().max(100),
    name: z.string().max(200),
    description: z.string().nullable(),
    isActive: z.boolean(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const GetPaymentMethodsResSchema = z.object({
    data: z.array(PaymentMethodSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetPaymentMethodsQuerySchema = z
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

export const GetPaymentMethodParamsSchema = z
    .object({
        paymentMethodId: z.coerce.number().int().positive(),
    })
    .strict();

export const CreatePaymentMethodBodySchema = z
    .object({
        key: z.string().trim().max(100),
        name: z.string().trim().max(200),
        description: z.string().trim().optional(),
        isActive: z.boolean().default(true),
    })
    .strict();

export const UpdatePaymentMethodBodySchema = CreatePaymentMethodBodySchema
    .partial()
    .strict();

export type PaymentMethodType = z.infer<typeof PaymentMethodSchema>;
export type GetPaymentMethodsResType = z.infer<typeof GetPaymentMethodsResSchema>;
export type GetPaymentMethodsQueryType = z.infer<typeof GetPaymentMethodsQuerySchema>;
export type CreatePaymentMethodBodyType = z.infer<typeof CreatePaymentMethodBodySchema>;
export type GetPaymentMethodParamsType = z.infer<typeof GetPaymentMethodParamsSchema>;
export type UpdatePaymentMethodBodyType = z.infer<typeof UpdatePaymentMethodBodySchema>;

export class GetPaymentMethodsResDTO extends createZodDto(GetPaymentMethodsResSchema) {}
export class GetPaymentMethodsQueryDTO extends createZodDto(GetPaymentMethodsQuerySchema) {}
export class GetPaymentMethodParamsDTO extends createZodDto(GetPaymentMethodParamsSchema) {}
export class PaymentMethodDTO extends createZodDto(PaymentMethodSchema) {}
export class CreatePaymentMethodBodyDTO extends createZodDto(CreatePaymentMethodBodySchema) {}
export class UpdatePaymentMethodBodyDTO extends createZodDto(UpdatePaymentMethodBodySchema) {}