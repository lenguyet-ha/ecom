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
import { S3Service } from './services/s3.service';
import { BrandRepository } from './repositories/brand.repository';
import { BrandTranslationRepository } from './repositories/brand-translation.repository';
import { CategoryRepository } from './repositories/category.repository';
import { CategoryTranslationRepository } from './repositories/category-translation.repository';
import { ProductRepository } from './repositories/product.repository';
import { ProductTranslationRepo } from './repositories/product-translation.repository';
import { CartRepo } from './repositories/cart.repo';

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
    S3Service,
    BrandRepository,
    BrandTranslationRepository,
    CategoryRepository,
    CategoryTranslationRepository,
    ProductRepository,
    ProductTranslationRepo,
    CartRepo,
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
