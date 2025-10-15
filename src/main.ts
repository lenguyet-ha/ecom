import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const reflector = app.get(Reflector);
    
    // Cấu hình CORS cho HTTP và WebSocket
    app.enableCors({
        origin: [
            'http://localhost:3000', 
            'http://localhost:7030',
            'http://127.0.0.1:5500', // Live Server
            'http://localhost:5500',
            'http://localhost:8080',
            'file://', // Cho phép file:// protocol
        ],
        credentials: true, // Cho phép credentials cho WebSocket
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    });
    
    app.useGlobalPipes(new ZodValidationPipe());
    // Tạm tắt để test
    // app.useGlobalInterceptors(new ZodSerializerInterceptor(reflector));
    app.useGlobalFilters(new HttpExceptionFilter());

    await app.listen(4000); // Đổi về port 3000 theo demo
}
void bootstrap();
