import { Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import { TokenService } from 'src/shared/services/token.service';
import { RoleService } from './role.service';
import { isNotFoundPrismaError, isUniqueConstraintPrismaError } from 'src/shared/helpers';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly prismaService: PrismaService,
        private readonly tokenService: TokenService,
        private readonly roleService: RoleService,
    ) {}

    async register(body: any) {
        try {
            const clientRoleId = await this.roleService.getClientRoleId();
            const hashedPassword = await this.hashingService.hash(body.password);
            const newUser = await this.prismaService.user.create({
                data: {
                    name: body.name,
                    email: body.email,
                    password: hashedPassword,
                    phoneNumber: body.phoneNumber,
                    roleId: clientRoleId,
                },
            });
            return newUser;
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new Error('Email already exists');
            }
            throw error;
        }
    }

    async login(body: any) {
        const user = await this.prismaService.user.findUnique({
            where: { email: body.email },
        });
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const isPasswordValid = await this.hashingService.compare(body.password, user.password);
        if (!isPasswordValid) {
            throw new UnprocessableEntityException([
                {
                    field: 'password',
                    error: 'Password is incorrect',
                },
            ]);
        }
        const tokens = await this.generateTokens({ userId: user.id });
        return { ...tokens };
    }

    async generateTokens(payload: { userId: number }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken(payload),
            this.tokenService.signRefreshToken(payload),
        ]);
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);

        const device = await this.prismaService.device.create({
            data: {
                userId: payload.userId,
                userAgent: 'Unknown',
                ip: '127.0.0.1',
            },
        });

        await this.prismaService.refreshToken.create({
            data: {
                token: refreshToken,
                userId: payload.userId,
                deviceId: device.id,
                expiresAt: new Date(decodedRefreshToken.exp * 1000),
            },
        });
        return { accessToken, refreshToken };
    }

    async refreshToken(oldRefreshToken: string) {
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(oldRefreshToken);
            const storedToken = await this.prismaService.refreshToken.findFirst({
                where: {
                    token: oldRefreshToken,
                    userId,
                },
            });
            if (!storedToken) {
                throw new Error('Invalid refresh token');
            }
            await this.prismaService.refreshToken.delete({
                where: {
                    token: oldRefreshToken,
                },
            });
            return await this.generateTokens({ userId });
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new Error('Invalid refresh token');
            }
            throw new UnauthorizedException();
        }
    }
    async logout(oldRefreshToken: string) {
        try {
            await this.prismaService.refreshToken.delete({
                where: {
                    token: oldRefreshToken,
                },
            });
        } catch (error) {
            if (isNotFoundPrismaError(error)) {
                throw new Error('Invalid refresh token');
            }
            throw new UnauthorizedException();
        }
    }
}
