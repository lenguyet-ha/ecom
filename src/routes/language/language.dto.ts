import { createZodDto } from 'nestjs-zod';
import z from 'zod';

export const LanguageSchema = z.object({
    id: z.string(),
    name: z.string().max(100),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});
export const GetLanguageDetailResSchema = LanguageSchema;

export const GetLanguagesResSchema = z.object({
    data: z.array(LanguageSchema),
    totalItems: z.number(),
});

export const GetLanguageParamsSchema = z
    .object({
        languageId: z.string(),
    })
    .strict();

export const CreateLanguageBodySchema = LanguageSchema.pick({
    id: true,
    name: true,
}).strict();

export const UpdateLanguageBodySchema = LanguageSchema.pick({
    name: true,
}).strict();

export type LanguageType = z.infer<typeof LanguageSchema>;
export type GetLanguagesResType = z.infer<typeof GetLanguagesResSchema>;
export type GetLanguageDetailResType = z.infer<typeof GetLanguageDetailResSchema>;
export type CreateLanguageBodyType = z.infer<typeof CreateLanguageBodySchema>;
export type GetLanguageParamsType = z.infer<typeof GetLanguageParamsSchema>;
export type UpdateLanguageBodyType = z.infer<typeof UpdateLanguageBodySchema>;

export class GetLanguagesResDTO extends createZodDto(GetLanguagesResSchema) {}

export class GetLanguageParamsDTO extends createZodDto(GetLanguageParamsSchema) {}

export class GetLanguageDetailResDTO extends createZodDto(GetLanguageDetailResSchema) {}

export class CreateLanguageBodyDTO extends createZodDto(CreateLanguageBodySchema) {}

export class UpdateLanguageBodyDTO extends createZodDto(UpdateLanguageBodySchema) {}
