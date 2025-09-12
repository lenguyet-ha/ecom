import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterBodyDTO, RegisterResDTO, SendOtpDTO } from './auth.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    // @ZodResponse({ type: RegisterResDTO })
    async register(@Body() body: RegisterBodyDTO) {
        return await this.authService.register(body);
        // return { userId: 123, email: 'test@example.com', password: 'secret', createdAt: new Date() };
    }

    @Post('otp')
    sendOTP(@Body() body: SendOtpDTO) {
        return this.authService.sendOTP(body);
    }
    @Post('login')
    async login(@Body() body: any) {
        return await this.authService.login(body);
    }
    @Post('refresh-token')
    @HttpCode(HttpStatus.OK)
    async refreshToken(@Body() body: any) {
        return await this.authService.refreshToken(body.refreshToken);
    }
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Body() body: any) {
        return await this.authService.logout(body.refreshToken);
    }

    @Post('forgot-password')
    @HttpCode(HttpStatus.OK)
    async forgotPassword(@Body() body: any) {
        return await this.authService.forgotPassword(body);
    }
}
