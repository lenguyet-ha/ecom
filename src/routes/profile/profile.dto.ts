import { z } from 'zod';
import { UserSchema } from '../auth/auth.dto';
import { createZodDto } from 'nestjs-zod';

export const UpdateMeBodySchema = UserSchema.pick({
    name: true,
    phoneNumber: true,
    avatar: true,
    password: true,
}).strict();

export const ChangePasswordBodySchema = UserSchema.pick({
    password: true,
})
    .extend({
        newPassword: z.string().min(6).max(100),
        confirmNewPassword: z.string().min(6).max(100),
    })
    .strict()
    .superRefine(({ newPassword, confirmNewPassword }, ctx) => {
        if (newPassword !== confirmNewPassword) {
            ctx.addIssue({
                code: 'custom',
                message: 'Error.ConfirmPasswordNotMatch',
                path: ['confirmNewPassword'],
            });
        }
    });

export type UpdateMeBodyType = z.infer<typeof UpdateMeBodySchema>;
export type ChangePasswordBodyType = z.infer<typeof ChangePasswordBodySchema>;

export class UpdateMeBodyDTO extends createZodDto(UpdateMeBodySchema) {}

export class ChangePasswordBodyDTO extends createZodDto(ChangePasswordBodySchema) {}
