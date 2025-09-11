import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { User, Prisma, VerificationCode } from '@prisma/client';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { RoleType } from 'src/routes/auth/auth.dto';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        data: Prisma.UserCreateInput,
    ): Promise<
        Omit<User, 'password' | 'totpSecret' >
    > {
        return this.prisma.user.create({
            data,
            omit: {
                password: true,
                totpSecret: true,
                // createdAt: true,
                // updatedAt: true,
                // createdById: true,
                // updatedById: true,
                // deletedAt: true,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email },
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Prisma.UserUpdateInput): Promise<User> {
        return this.prisma.user.update({
            where: { id },
            data,
        });
    }

    async delete(id: number): Promise<User> {
        return this.prisma.user.delete({
            where: { id },
        });
    }

    async createVerificationCode(
        payload: Pick<VerificationCode, 'email' | 'type' | 'code' | 'expiresAt'>,
    ): Promise<VerificationCode> {
        return this.prisma.verificationCode.upsert({
            where: {
                email_type: {
                    email: payload.email,
                    type: payload.type,
                },
            },
            create: payload,
            update: {
                code: payload.code,
                expiresAt: payload.expiresAt,
            },
        });
    }
    async findVerificationCode(uniqueValue: {
        email: string;
        code: string;
        type: TypeOfVerificationCodeType;
    }): Promise<VerificationCode | null> {
        return await this.prisma.verificationCode.findFirst({
            where: uniqueValue,
        });
    }

    async findByEmailWithRole(email: string): Promise<(User & { role: RoleType }) | null> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    }
}
