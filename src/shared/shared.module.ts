import { Global, Module } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import { HashingService } from './services/hashing.service';
import { TokenService } from './services/token.service';
import { JwtModule } from '@nestjs/jwt';
import { AccessTokenGuard } from 'src/shared/guards/access-token.guard';
import { APIKeyGuard } from 'src/shared/guards/api-key.guard';
import { APP_GUARD } from '@nestjs/core';
import { AuthenticationGuard } from 'src/shared/guards/authentication.guard';
import { UserRepository } from './repositories/user.repository';
import { DeviceRepository } from './repositories/device.repository';
import { RefreshTokenRepository } from './repositories/refresh-token.repository';
import { LanguageRepo } from './repositories/language.repo';
import { PermissionRepo } from './repositories/permission.repo';
import { RoleRepo } from './repositories/role.repository';

const sharedServices = [
    PrismaService,
    HashingService,
    TokenService,
    UserRepository,
    DeviceRepository,
    RefreshTokenRepository,
    LanguageRepo,
    PermissionRepo,
    RoleRepo,
];

@Global()
@Module({
    providers: [
        ...sharedServices,
        AccessTokenGuard,
        APIKeyGuard,
        {
            provide: APP_GUARD,
            useClass: AuthenticationGuard,
        },
    ],
    exports: sharedServices,
    imports: [JwtModule],
})
export class SharedModule {}
