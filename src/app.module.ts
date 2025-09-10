import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './routes/auth/auth.module';
import { APP_PIPE } from '@nestjs/core';
import { CustomZodValidationPipe } from './shared/pipes/custom-zod-validation.pipe';

@Module({
    imports: [SharedModule, AuthModule],
    controllers: [AppController],
    providers: [
        AppService,
        {
            provide: APP_PIPE,
            useClass: CustomZodValidationPipe,
        },
    ],
})
export class AppModule {}
