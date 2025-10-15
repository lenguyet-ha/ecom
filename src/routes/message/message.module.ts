import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { MessageRepository } from 'src/shared/repositories/message.repo';
import { MessageGateway } from './message.gateway';
import { SharedModule } from 'src/shared/shared.module';
import { JwtModule } from '@nestjs/jwt';
import envConfig from 'src/shared/config';

@Module({
    imports: [
        SharedModule,
        JwtModule.register({
            secret: envConfig.ACCESS_TOKEN_SECRET,
            signOptions: { expiresIn: envConfig.ACCESS_TOKEN_EXPIRES_IN },
        }),
    ],
    controllers: [MessageController],
    providers: [MessageService, MessageRepository, MessageGateway],
    exports: [MessageGateway], // Export để có thể sử dụng từ modules khác
})
export class MessageModule {}