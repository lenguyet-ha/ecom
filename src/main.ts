import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);
    app.enableCors({
        origin: ['http://localhost:3000', 'http://localhost:7030'], // Cho phép cả hai origin
        credentials: false, // Nếu dùng cookies/auth, set thành true
    });
    app.useGlobalPipes(new ZodValidationPipe());
    // Tạm tắt để test
    // app.useGlobalInterceptors(new ZodSerializerInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(4000);
}
void bootstrap();
