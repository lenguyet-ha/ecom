import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { User, Prisma, VerificationCode } from '@prisma/client';
import { TypeOfVerificationCodeType } from 'src/shared/constants/auth.constant';
import { RoleType, UserType } from 'src/routes/auth/auth.dto';
import { PermissionType } from 'src/routes/permission/permission.dto';
import { UpdateMeBodyType } from 'src/routes/profile/profile.dto';

type UserIncludeRolePermissionsType = UserType & { role: RoleType & { permissions: PermissionType[] } };

type WhereUniqueUserType = { id: number; [key: string]: any } | { email: string; [key: string]: any };

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(
        data: Prisma.UserCreateInput,
    ): Promise<
        Omit<User, 'password' | 'totpSecret' | 'createdAt' | 'updatedAt' | 'createdById' | 'updatedById' | 'deletedAt'>
    > {
        return this.prisma.user.create({
            data,
            omit: {
                password: true,
                totpSecret: true,
                createdAt: true,
                updatedAt: true,
                createdById: true,
                updatedById: true,
                deletedAt: true,
            },
        });
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { email, deletedAt: null },
        });
    }

    async findById(id: number): Promise<User | null> {
        return this.prisma.user.findUnique({
            where: { id },
        });
    }

    async update(id: number, data: Partial<UserType>): Promise<User> {
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

    async findByEmailWithRole(email: string): Promise<any> {
        return this.prisma.user.findUnique({
            where: { email },
            include: { role: true },
        });
    }

    async findUniqueIncludeRolePermissions(where: WhereUniqueUserType): Promise<UserIncludeRolePermissionsType | null> {
        const result = await this.prisma.user.findUnique({
            where,
            include: {
                role: {
                    include: {
                        permissions: {
                            where: {
                                deletedAt: null,
                            },
                        },
                    },
                },
            },
        });
        return result as UserIncludeRolePermissionsType | null;
    }
}
