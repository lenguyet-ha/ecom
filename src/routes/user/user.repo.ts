import { Injectable } from '@nestjs/common';
import { CreateUserBodyType, GetUsersQueryType, GetUsersResType, UpdateUserBodyType } from 'src/routes/user/user.dto';
import { PrismaService } from 'src/shared/services/prisma.service';
import { UserType } from '../auth/auth.dto';

@Injectable()
export class UserRepo {
    constructor(private prismaService: PrismaService) {}

    async list(pagination: GetUsersQueryType): Promise<GetUsersResType> {
        const skip = (pagination.page - 1) * pagination.limit;
        const take = pagination.limit;
        const [totalItems, data] = await Promise.all([
            this.prismaService.user.count({
                where: {
                    deletedAt: null,
                },
            }),
            this.prismaService.user.findMany({
                where: {
                    deletedAt: null,
                },
                skip,
                take,
                include: {
                    role: true,
                },
            }),
        ]);
        return {
            data,
            totalItems,
            page: pagination.page,
            limit: pagination.limit,
            totalPages: Math.ceil(totalItems / pagination.limit),
        };
    }

    create({ createdById, data }: { createdById: number | null; data: CreateUserBodyType }): Promise<UserType> {
        return this.prismaService.user.create({
            data: {
                ...data,
                password: data.password as string,
                createdById,
            },
        });
    }

    delete(
        {
            id,
            deletedById,
        }: {
            id: number;
            deletedById: number;
        },
        isHard?: boolean,
    ): Promise<UserType> {
        return isHard
            ? this.prismaService.user
                  .delete({
                      where: {
                          id,
                      },
                  })
                  .then((user) => ({ ...user, deletedAt: user.deletedAt?.toISOString() || null }) as UserType)
            : this.prismaService.user
                  .update({
                      where: {
                          id,
                          deletedAt: null,
                      },
                      data: {
                          deletedAt: new Date(),
                          deletedById,
                      },
                  })
                  .then((user) => ({ ...user, deletedAt: user.deletedAt?.toISOString() || null }) as UserType);
    }
}
