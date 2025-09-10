import { Injectable } from '@nestjs/common';
import { PrismaService } from '../services/prisma.service';
import { User, Prisma } from '@prisma/client';

@Injectable()
export class UserRepository {
    constructor(private readonly prisma: PrismaService) {}

    async create(data: Prisma.UserCreateInput): Promise<Omit<User, 'password' | 'totpSecret'>> {
        return this.prisma.user.create({
            data,
            omit: {
                password: true,
                totpSecret: true,
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
}
