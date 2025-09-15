import { createZodDto } from 'nestjs-zod';
import { HTTPMethod } from 'src/shared/constants/role.constant';
import { z } from 'zod';

export const PermissionSchema = z.object({
    id: z.number(),
    name: z.string().max(500),
    description: z.string(),
    path: z.string().max(1000),
    method: z.enum([
        HTTPMethod.GET,
        HTTPMethod.POST,
        HTTPMethod.PUT,
        HTTPMethod.DELETE,
        HTTPMethod.PATCH,
        HTTPMethod.OPTIONS,
        HTTPMethod.HEAD,
    ]),
    module: z.string().max(255),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const GetPermissionsResSchema = z.object({
    data: z.array(PermissionSchema),
    totalItems: z.number(), // Tổng số item
    page: z.number(), // Số trang hiện tại
    limit: z.number(), // Số item trên 1 trang
    totalPages: z.number(), // Tổng số trang
});

export const GetPermissionsQuerySchema = z
    .object({
        page: z.coerce.number().int().positive().default(1), // Phải thêm coerce để chuyển từ string sang number
        limit: z.coerce.number().int().positive().default(10), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetPermissionParamsSchema = z
    .object({
        permissionId: z.coerce.number(), // Phải thêm coerce để chuyển từ string sang number
    })
    .strict();

export const GetPermissionDetailResSchema = PermissionSchema;

export const CreatePermissionBodySchema = PermissionSchema.pick({
    name: true,
    path: true,
    method: true,
    module: true,
}).strict();

export const UpdatePermissionBodySchema = CreatePermissionBodySchema;

export type PermissionType = z.infer<typeof PermissionSchema>;
export type GetPermissionsResType = z.infer<typeof GetPermissionsResSchema>;
export type GetPermissionsQueryType = z.infer<typeof GetPermissionsQuerySchema>;
export type GetPermissionDetailResType = z.infer<typeof GetPermissionDetailResSchema>;
export type CreatePermissionBodyType = z.infer<typeof CreatePermissionBodySchema>;
export type GetPermissionParamsType = z.infer<typeof GetPermissionParamsSchema>;
export type UpdatePermissionBodyType = z.infer<typeof UpdatePermissionBodySchema>;

export class GetPermissionsResDTO extends createZodDto(GetPermissionsResSchema) {}

export class GetPermissionParamsDTO extends createZodDto(GetPermissionParamsSchema) {}

export class GetPermissionDetailResDTO extends createZodDto(GetPermissionDetailResSchema) {}

export class CreatePermissionBodyDTO extends createZodDto(CreatePermissionBodySchema) {}

export class UpdatePermissionBodyDTO extends createZodDto(UpdatePermissionBodySchema) {}

export class GetPermissionsQueryDTO extends createZodDto(GetPermissionsQuerySchema) {}
