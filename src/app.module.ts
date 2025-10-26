import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CustomZodValidationPipe } from './shared/pipes/custom-zod-validation.pipe';
import { ZodSerializerInterceptor } from 'nestjs-zod';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { LanguageModule } from './routes/language/language.module';
import { PermissionModule } from './routes/permission/permission.module';
import { RoleModule } from './routes/role/role.module';
import { ProfileModule } from './routes/profile/profile.module';
import { UserModule } from './routes/user/user.module';
import { MediaModule } from './routes/media/media.module';
import { BrandModule } from './routes/brand/brand.module';
import { BrandTranslationModule } from './routes/brand-translation/brand-translation.module';
import { CategoryModule } from './routes/category/category.module';
import { CategoryTranslationModule } from './routes/category-translation/category-translation.module';
import { ProductTranslationModule } from './routes/product/product-translation/product-translation.module';
import { ProductModule } from './routes/product/product.module';
import { CartModule } from './routes/cart/cart.module';
import { OrderModule } from './routes/order/order.module';
import { BullModule } from '@nestjs/bullmq';
import { PaymentModule } from './routes/payment/payment.module';
import { ReviewModule } from './routes/review/review.module';
import { MessageModule } from './routes/message/message.module';
import { PaymentMethodModule } from './routes/payment-method/payment-method.module';
import { ShippingMethodModule } from './routes/shipping-method/shipping-method.module';
import { DiscountCodeModule } from './routes/discount-code/discount-code.module';

@Module({
    imports: [
        BullModule.forRoot({
            connection: {
                host: 'redis-18572.c295.ap-southeast-1-1.ec2.redns.redis-cloud.com',
                port: 18572,
                username: 'default',
                password: 'yj5VwrsaHCtOpJ0Y2ANf2DGdyeAq19t7',
            },
        }),
        SharedModule,
        AuthModule,
        LanguageModule,
        PermissionModule,
        RoleModule,
        ProfileModule,
        UserModule,
        MediaModule,
        BrandModule,
        BrandTranslationModule,
        CategoryModule,
        CategoryTranslationModule,
        ProductModule,
        ProductTranslationModule,
        CartModule,
        OrderModule,
        PaymentModule,
        ReviewModule,
        MessageModule,
        PaymentMethodModule,
        ShippingMethodModule,
        DiscountCodeModule,
    ],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useClass: CustomZodValidationPipe,
        },
        { provide: APP_INTERCEPTOR, useClass: ZodSerializerInterceptor },
        {
            provide: APP_FILTER,
            useClass: HttpExceptionFilter,
        },
    ],
})
export class AppModule {}
