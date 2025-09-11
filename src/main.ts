import { NestFactory } from '@nestjs/core';
import { Reflector } from '@nestjs/core';
import { ZodValidationPipe, ZodSerializerInterceptor } from 'nestjs-zod';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const reflector = app.get(Reflector);
  
  app.useGlobalPipes(new ZodValidationPipe());
  // Tạm tắt để test
  // app.useGlobalInterceptors(new ZodSerializerInterceptor(reflector));
  app.useGlobalFilters(new HttpExceptionFilter());
  
  await app.listen(3000);
}
void bootstrap();
