import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { RefreshToken, Prisma } from '@prisma/client';

@Injectable()
export class RefreshTokenRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.RefreshTokenCreateInput): Promise<RefreshToken> {
        return this.prisma.refreshToken.create({
            data,
        });
    }

    async findByToken(token: string): Promise<RefreshToken | null> {
        return this.prisma.refreshToken.findUnique({
            where: { token },
        });
    }

    async findByUserId(userId: number): Promise<RefreshToken[]> {
        return this.prisma.refreshToken.findMany({
            where: { userId },
        });
    }

    async findByDeviceId(deviceId: number): Promise<RefreshToken[]> {
        return this.prisma.refreshToken.findMany({
            where: { deviceId },
        });
    }

    async delete(token: string): Promise<RefreshToken> {
        return this.prisma.refreshToken.delete({
            where: { token },
        });
    }

    async deleteExpired(): Promise<{ count: number }> {
        return this.prisma.refreshToken.deleteMany({
            where: {
                expiresAt: {
                    lt: new Date(),
                },
            },
        });
    }

    async deleteByUserId(userId: number): Promise<{ count: number }> {
        return this.prisma.refreshToken.deleteMany({
            where: { userId },
        });
    }

    async deleteByDeviceId(deviceId: number): Promise<{ count: number }> {
        return this.prisma.refreshToken.deleteMany({
            where: { deviceId },
        });
    }
}
