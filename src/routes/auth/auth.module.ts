import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RoleService } from './role.service';

@Module({
    providers: [AuthService, RoleService],
    controllers: [AuthController],
})
export class AuthModule {}
