import {
    BadRequestException,
    HttpException,
    Injectable,
    UnauthorizedException,
    UnprocessableEntityException,
} from '@nestjs/common';
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
import { ForgotPasswordBodyType } from './auth.dto';

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

    async validateVerifycationCode(email: string, code: string, type: string) {
        const verifycationCode = await this.userRepository.findVerificationCode({
            email,
            code,
            type: TypeOfVerificationCode.REGISTER,
        });
        if (!verifycationCode || verifycationCode.code !== code) {
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
    }

    async register(body: any) {
        try {
            // await this.validateVerifycationCode(body.email, body.code, TypeOfVerificationCode.REGISTER);
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
        const user = await this.userRepository.findByEmailWithRole(body.email);
        console.log(user);

        if (!user) {
            throw new UnprocessableEntityException([
                {
                    message: 'Email không tồn tại',
                    path: 'email',
                },
            ]);
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
        const tokens = await this.generateTokens({ userId: user.id, roleId: user.roleId, roleName: user.role.name });
        return { ...tokens };
    }

    async generateTokens({ userId, roleId, roleName }) {
        const [accessToken, refreshToken] = await Promise.all([
            this.tokenService.signAccessToken({
                userId,
                roleId,
                roleName,
            }),
            this.tokenService.signRefreshToken({ userId }),
        ]);
        const decodedRefreshToken = await this.tokenService.verifyRefreshToken(refreshToken);

        // Create or find a device for this user
        const device = await this.deviceRepository.create({
            user: { connect: { id: userId } },
            userAgent: 'Unknown', // You should pass this from the request
            ip: '127.0.0.1', // You should pass this from the request
        });

        await this.refreshTokenRepository.create({
            token: refreshToken,
            user: { connect: { id: userId } },
            device: { connect: { id: device.id } },
            expiresAt: new Date(decodedRefreshToken.exp * 1000),
        });
        return { accessToken, refreshToken };
    }

    async refreshToken({ refreshToken }: { refreshToken: string }) {
        try {
            const { userId } = await this.tokenService.verifyRefreshToken(refreshToken);
            // 2. Kiểm tra refreshToken có tồn tại trong database không
            const refreshTokenInDb = await this.refreshTokenRepository.findUniqueRefreshTokenIncludeUserRole({
                token: refreshToken,
            });
            if (!refreshTokenInDb) {
                // Trường hợp đã refresh token rồi, hãy thông báo cho user biết
                // refresh token của họ đã bị đánh cắp
                throw new UnauthorizedException('Refresh Token đã được sử dụng');
            }
            const {
                user: { roleId, name: roleName },
            } = refreshTokenInDb;
            // 3. Cập nhật device

            // 4. Xóa refreshToken cũ
            const $deleteRefreshToken = this.refreshTokenRepository.delete(refreshToken);
            // 5. Tạo mới accessToken và refreshToken
            const $tokens = this.generateTokens({ userId, roleId, roleName });
            const [, tokens] = await Promise.all([$deleteRefreshToken, $tokens]);
            return tokens;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new UnauthorizedException();
        }
    }

    async logout(oldRefreshToken: string) {
        try {
            await this.refreshTokenRepository.delete(oldRefreshToken);
        } catch (error) {
            throw new BadRequestException('Invalid refresh token');
        }
    }

    async forgotPassword(body: ForgotPasswordBodyType) {
        const { email, code, newPassword } = body;
        const user = await this.userRepository.findByEmail(email);
        if (!user) {
            throw new UnprocessableEntityException([
                {
                    message: 'Email không tồn tại',
                },
            ]);
        }
        // await this.validateVerifycationCode(email, code, TypeOfVerificationCode.FORGOT_PASSWORD);

        const hashedPassword = await this.hashingService.hash(newPassword);
        await this.userRepository.update(user.id, { password: hashedPassword });
        return { message: 'Đổi mật khẩu thành công' };
    }
}
