import { BadRequestException, Injectable, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { HashingService } from 'src/shared/services/hashing.service';
import { TokenService } from 'src/shared/services/token.service';
import { RoleService } from './role.service';
import { generateOTP, isUniqueConstraintPrismaError } from 'src/shared/helpers';
import { UserRepository } from 'src/shared/repositories/user.repository';
import { DeviceRepository } from 'src/shared/repositories/device.repository';
import { RefreshTokenRepository } from 'src/shared/repositories/refresh-token.repository';
import envConfig from 'src/shared/config';
import { addMilliseconds } from 'date-fns';
import ms from 'ms';
import { TypeOfVerificationCode } from 'src/shared/constants/auth.constant';

@Injectable()
export class AuthService {
    constructor(
        private readonly hashingService: HashingService,
        private readonly tokenService: TokenService,
        private readonly roleService: RoleService,
        private readonly userRepository: UserRepository,
        private readonly deviceRepository: DeviceRepository,
        private readonly refreshTokenRepository: RefreshTokenRepository,
    ) {}

    async register(body: any) {
        try {
            const verifycationCode = await this.userRepository.findVerificationCode({
                email: body.email,
                code: body.code,
                type: TypeOfVerificationCode.REGISTER,
            });
            if (!verifycationCode || verifycationCode.code !== body.code) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Mã OTP không hợp lệ',
                        paht: 'code',
                    },
                ]);
            }
            if (verifycationCode.expiresAt < new Date()) {
                throw new UnprocessableEntityException([
                    {
                        message: 'Mã OTP đã hết hạn',
                        paht: 'code',
                    },
                ]);
            }
            const clientRoleId = await this.roleService.getClientRoleId();
            const hashedPassword = await this.hashingService.hash(body.password);
            const newUser = await this.userRepository.create({
                name: body.name,
                email: body.email,
                password: hashedPassword,
                phoneNumber: body.phoneNumber,
                role: { connect: { id: clientRoleId } },
            });
            return newUser;
        } catch (error) {
            if (isUniqueConstraintPrismaError(error)) {
                throw new BadRequestException('Email already exists');
            }
            throw error;
        }
    }
    async sendOTP(body: any) {
        // 1. Kiểm tra email đã tồn tại trong database chưa
        const user = await this.userRepository.findByEmail(body.email);
        if (user) {
            throw new UnprocessableEntityException([
                {
                    message: 'Email đã tồn tại',
                    path: 'email',
                },
            ]);
        }
        // 2. Tạo mã OTP
        const code = generateOTP();
        const verificationCode = this.userRepository.createVerificationCode({
            email: body.email,
            code,
            type: body.type,
            expiresAt: addMilliseconds(new Date(), ms(envConfig.OTP_EXPIRES_IN)),
        });
        // 3. Gửi mã OTP
        return verificationCode;
    }
    async login(body: any) {
        const user = await this.userRepository.findByEmail(body.email);
        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
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

        // Create or find a device for this user
        const device = await this.deviceRepository.create({
            user: { connect: { id: payload.userId } },
            userAgent: 'Unknown', // You should pass this from the request
            ip: '127.0.0.1', // You should pass this from the request
        });

        await this.refreshTokenRepository.create({
            token: refreshToken,
            user: { connect: { id: payload.userId } },
            device: { connect: { id: device.id } },
            expiresAt: new Date(decodedRefreshToken.exp * 1000),
        });
        return { accessToken, refreshToken };
    }

    async refreshToken(oldRefreshToken: string) {
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(oldRefreshToken);
            const storedToken = await this.refreshTokenRepository.findByToken(oldRefreshToken);
            if (!storedToken || storedToken.userId !== userId) {
                throw new BadRequestException('Invalid refresh token');
            }
            await this.refreshTokenRepository.delete(oldRefreshToken);
            return await this.generateTokens({ userId });
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(oldRefreshToken: string) {
        try {
            await this.refreshTokenRepository.delete(oldRefreshToken);
        } catch (error) {
            throw new BadRequestException('Invalid refresh token');
        }
    }
}
