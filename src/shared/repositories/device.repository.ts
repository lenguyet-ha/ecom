import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { Device, Prisma } from '@prisma/client';

@Injectable()
export class DeviceRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.DeviceCreateInput): Promise<Device> {
        return this.prisma.device.create({
            data,
        });
    }

    async findByUserAndInfo(userId: number, userAgent: string, ip: string): Promise<Device | null> {
        return this.prisma.device.findFirst({
            where: {
                userId,
                userAgent,
                ip,
                isActive: true,
            },
        });
    }

    async findById(id: number): Promise<Device | null> {
        return this.prisma.device.findUnique({
            where: { id },
        });
    }

    async updateLastActive(id: number): Promise<Device> {
        return this.prisma.device.update({
            where: { id },
            data: {
                lastActive: new Date(),
            },
        });
    }

    async deactivate(id: number): Promise<Device> {
        return this.prisma.device.update({
            where: { id },
            data: {
                isActive: false,
            },
        });
    }
}
