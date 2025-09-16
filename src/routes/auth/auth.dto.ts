import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import z from 'zod';
import { PermissionSchema } from '../permission/permission.dto';

export const UserSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    avatar: z.string().nullable(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.iso.datetime().nullable(),
    createdAt: z.iso.datetime(),
    updatedAt: z.iso.datetime(),
    password: z.string().optional(),
});

const RegisterBodySchema = UserSchema.pick({
    name: true,
    email: true,
    phoneNumber: true,
})
    .extend({
        password: z.string().min(6).max(100),
        confirmPassword: z.string().min(6).max(100),
        // code: z.string().length(6),
    })
    .strict()
    .superRefine(({ confirmPassword, password }, ctx) => {
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Passwords do not match',
            });
        }
    });

export const RegisterResSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    avatar: z.string().nullable().optional(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]).optional(),
    roleId: z.number().optional(),
});

const VerificationCode = z.object({
    id: z.number(),
    email: z.string().email(),
    code: z.string().length(6),
    type: z.enum([TypeOfVerificationCode.REGISTER, TypeOfVerificationCode.FORGOT_PASSWORD]),
    expiresAt: z.iso.datetime(),
    createdAt: z.iso.datetime(),
});

export const SendOTPBodySchema = VerificationCode.pick({
    email: true,
    type: true,
}).strict();

export const RoleSchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
});

export const ForgotPasswordBodySchema = z
    .object({
        email: z.string().email(),
        code: z.string().length(6),
        newPassword: z.string().min(6).max(100),
        confirmNewPassword: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
        if (newPassword !== confirmNewPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Mật khẩu và mật khẩu xác nhận phải giống nhau',
            });
        }
    });

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export const GetUserProfileResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
}).extend({
    role: RoleSchema.pick({
        id: true,
        name: true,
    }).extend({
        permissions: z.array(
            PermissionSchema.pick({
                id: true,
                name: true,
                module: true,
                path: true,
                method: true,
            }),
        ),
    }),
});

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export const UpdateProfileResSchema = UserSchema.omit({
    password: true,
    totpSecret: true,
});

export type ForgotPasswordBodyType = z.infer<typeof ForgotPasswordBodySchema>;

export type RoleType = z.infer<typeof RoleSchema>;

export type UserType = z.infer<typeof UserSchema>;

export type GetUserProfileResType = z.infer<typeof GetUserProfileResSchema>;

export type UpdateProfileResType = z.infer<typeof UpdateProfileResSchema>;

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class VerificationCodeDTO extends createZodDto(VerificationCode) {}

export class SendOtpDTO extends createZodDto(SendOTPBodySchema) {}

/**
 * Áp dụng cho Response của api GET('profile') và GET('users/:userId')
 */
export class GetUserProfileResDTO extends createZodDto(GetUserProfileResSchema) {}

/**
 * Áp dụng cho Response của api PUT('profile') và PUT('users/:userId')
 */
export class UpdateProfileResDTO extends createZodDto(UpdateProfileResSchema) {}
