import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
import z from 'zod';
import id from 'zod/v4/locales/id.js';

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
});

const RegisterBodySchema = z
    .object({
        email: z.string().email(),
        name: z.string().min(2).max(100),
        phoneNumber: z.string().min(9).max(15),
        password: z.string().min(6).max(100),
        confirmPassword: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ password, confirmPassword }, ctx) => {
        if (password !== confirmPassword) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: 'Password and confirm password do not match',
                path: ['confirmPassword'],
            });
        }
    });

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(UserSchema) {}
