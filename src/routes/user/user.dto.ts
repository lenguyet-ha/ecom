import { z } from 'zod';
import { RoleSchema, UpdateProfileResDTO, UserSchema } from '../auth/auth.dto';
import { createZodDto } from 'nestjs-zod';

export const GetUsersResSchema = z.object({
    data: z.array(
        UserSchema.omit({ password: true, totpSecret: true }).extend({
            role: RoleSchema.pick({
                id: true,
                name: true,
            }),
        }),
    ),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetUsersQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
    })
    .strict();

export const GetUserParamsSchema = z
    .object({
        userId: z.coerce.number().int().positive(),
    })
    .strict();

export const CreateUserBodySchema = UserSchema.pick({
    email: true,
    name: true,
    phoneNumber: true,
    avatar: true,
    status: true,
    password: true,
    roleId: true,
}).strict();

export const UpdateUserBodySchema = CreateUserBodySchema;

export type GetUsersResType = z.infer<typeof GetUsersResSchema>;
export type GetUsersQueryType = z.infer<typeof GetUsersQuerySchema>;
export type GetUserParamsType = z.infer<typeof GetUserParamsSchema>;
export type CreateUserBodyType = z.infer<typeof CreateUserBodySchema>;
export type UpdateUserBodyType = z.infer<typeof UpdateUserBodySchema>;

export class GetUsersResDTO extends createZodDto(GetUsersResSchema) {}

export class GetUsersQueryDTO extends createZodDto(GetUsersQuerySchema) {}

export class GetUserParamsDTO extends createZodDto(GetUserParamsSchema) {}

export class CreateUserBodyDTO extends createZodDto(CreateUserBodySchema) {}

export class UpdateUserBodyDTO extends createZodDto(UpdateUserBodySchema) {}

export class CreateUserResDTO extends UpdateProfileResDTO {}
