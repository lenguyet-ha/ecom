import { z } from 'zod';
import { PermissionSchema } from '../permission/permission.dto';
import { RoleSchema } from '../auth/auth.dto';
import { createZodDto } from 'nestjs-zod';

export const RoleWithPermissionsSchema = RoleSchema.extend({
    permissions: z.array(PermissionSchema),
});

export const GetRolesResSchema = z.object({
    data: z.array(RoleSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetRolesQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(10),
    })
    .strict();

export const GetRoleParamsSchema = z
    .object({
        roleId: z.coerce.number(),
    })
    .strict();

export const GetRoleDetailResSchema = RoleWithPermissionsSchema;

export const CreateRoleBodySchema = RoleSchema.pick({
    name: true,
    description: true,
    isActive: true,
}).strict();

export const CreateRoleResSchema = RoleSchema;

export const UpdateRoleBodySchema = RoleSchema.pick({
    name: true,
    description: true,
    isActive: true,
})
    .extend({
        permissionIds: z.array(z.number()),
    })
    .strict();

export const RolePermissionsSchema = RoleSchema.extend({
    permissions: z.array(PermissionSchema),
});

export type RoleType = z.infer<typeof RoleSchema>;
export type RoleWithPermissionsType = z.infer<typeof RoleWithPermissionsSchema>;
export type GetRolesResType = z.infer<typeof GetRolesResSchema>;
export type GetRolesQueryType = z.infer<typeof GetRolesQuerySchema>;
export type GetRoleDetailResType = z.infer<typeof GetRoleDetailResSchema>;
export type CreateRoleResType = z.infer<typeof CreateRoleResSchema>;
export type CreateRoleBodyType = z.infer<typeof CreateRoleBodySchema>;
export type GetRoleParamsType = z.infer<typeof GetRoleParamsSchema>;
export type UpdateRoleBodyType = z.infer<typeof UpdateRoleBodySchema>;

export class GetRolesResDTO extends createZodDto(GetRolesResSchema) {}

export class GetRoleParamsDTO extends createZodDto(GetRoleParamsSchema) {}

export class GetRoleDetailResDTO extends createZodDto(GetRoleDetailResSchema) {}

export class CreateRoleBodyDTO extends createZodDto(CreateRoleBodySchema) {}

export class CreateRoleResDTO extends createZodDto(CreateRoleResSchema) {}

export class UpdateRoleBodyDTO extends createZodDto(UpdateRoleBodySchema) {}

export class GetRolesQueryDTO extends createZodDto(GetRolesQuerySchema) {}

export type RolePermissionsType = z.infer<typeof RolePermissionsSchema>;
