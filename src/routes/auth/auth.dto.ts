import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';
import z from 'zod';

const UserSchema = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string(),
    avatar: z.string().nullable(),
    status: z.enum([UserStatus.ACTIVE, UserStatus.INACTIVE, UserStatus.BLOCKED]),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedAt: z.date().nullable(),
    createdAt: z.date(),
    updatedAt: z.date(),
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
    expiresAt: z.date(),
    createdAt: z.date(),
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

export type RoleType = z.infer<typeof RoleSchema>;

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(RegisterResSchema) {}

export class VerificationCodeDTO extends createZodDto(VerificationCode) {}

export class SendOtpDTO extends createZodDto(SendOTPBodySchema) {}
