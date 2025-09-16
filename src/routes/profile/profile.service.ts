import { Injectable } from '@nestjs/common';
import { InvalidPasswordException, NotFoundRecordException } from 'src/shared/types/error';
import { ChangePasswordBodyType, UpdateMeBodySchema, UpdateMeBodyType } from './profile.dto';

import { HashingService } from 'src/shared/services/hashing.service';
import { isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { UserRepository } from 'src/shared/repositories/user.repository';

@Injectable()
export class ProfileService {
    constructor(
        private readonly sharedUserRepository: UserRepository,
        private readonly hashingService: HashingService,
    ) {}

    async getProfile(userId: number) {
        const user = await this.sharedUserRepository.findUniqueIncludeRolePermissions({
            id: userId,
            deletedAt: null,
        });

        if (!user) {
            throw NotFoundRecordException;
        }

        return user;
    }

    async updateProfile({ userId, body }: { userId: number; body: UpdateMeBodyType }) {
        try {
            return await this.sharedUserRepository.update(userId, body);
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw NotFoundRecordException;
            }
            throw error;
        }
    }

    async changePassword({
        userId,
        body,
    }: {
        userId: number;
        body: Omit<ChangePasswordBodyType, 'confirmNewPassword'>;
    }) {
        try {
            const { password, newPassword } = body;
            const user = await this.sharedUserRepository.findById(userId);
            if (!user) {
                throw NotFoundRecordException;
            }
            const isPasswordMatch = await this.hashingService.compare(password as string, user.password);
            if (!isPasswordMatch) {
                throw InvalidPasswordException;
            }
            const hashedPassword = await this.hashingService.hash(newPassword);

            await this.sharedUserRepository.update(userId, {
                password: hashedPassword, // ← CHỈ update password, không spread body
            });

            return {
                message: 'Password changed successfully',
            };
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw NotFoundRecordException;
            }
            throw error;
        }
    }
}
