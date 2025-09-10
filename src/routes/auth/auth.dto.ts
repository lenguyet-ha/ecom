import { UserStatus } from '@prisma/client';
import { createZodDto } from 'nestjs-zod';
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
});

const RegisterBodySchema = UserSchema.pick({
    name: true,
    email: true,
    phoneNumber: true,
})
    .extend({
        password: z.string().min(6).max(100),
        confirmPassword: z.string().min(6).max(100),
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

export class RegisterBodyDTO extends createZodDto(RegisterBodySchema) {}

export class RegisterResDTO extends createZodDto(UserSchema) {}
