import { Body, Controller, Get, Param, Post, Put, Query } from '@nestjs/common';
import { MessageService } from './message.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import { Auth } from 'src/shared/decorators/auth.decorator';
import { AuthType } from 'src/shared/constants/auth.constant';
import {
    GetConversationsQueryDTO,
    GetConversationsResDTO,
    GetMessagesQueryDTO,
    GetMessagesResDTO,
    GetUnreadCountResDTO,
    MarkAsReadBodyDTO,
    SendMessageBodyDTO,
    SendMessageResDTO,
} from './message.dto';

@Controller('messages')
@Auth([AuthType.Bearer]) // Chỉ cần JWT authentication, không check permission
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    sendMessage(
        @ActiveUser('userId') userId: number,
        @Body() body: SendMessageBodyDTO,
    ): Promise<SendMessageResDTO> {
        return this.messageService.sendMessage(userId, body);
    }

    @Get('conversations')
    getConversations(
        @ActiveUser('userId') userId: number,
        @Query() query: GetConversationsQueryDTO,
    ): Promise<GetConversationsResDTO> {
        return this.messageService.getConversations(userId, query);
    }

    @Get('conversation/:userId')
    getMessages(
        @ActiveUser('userId') currentUserId: number,
        @Param('userId') otherUserId: string,
        @Query() query: Omit<GetMessagesQueryDTO, 'userId'>,
    ): Promise<GetMessagesResDTO> {
        const messagesQuery = {
            ...query,
            userId: parseInt(otherUserId),
        };
        return this.messageService.getMessages(currentUserId, messagesQuery);
    }

    @Get('unread-count')
    getUnreadCount(@ActiveUser('userId') userId: number): Promise<GetUnreadCountResDTO> {
        return this.messageService.getUnreadCount(userId);
    }

    @Put('mark-as-read')
    markAsRead(
        @ActiveUser('userId') userId: number,
        @Body() body: MarkAsReadBodyDTO,
    ): Promise<{ message: string }> {
        return this.messageService.markAsRead(userId, body);
    }

    @Put('mark-conversation-as-read/:fromUserId')
    markConversationAsRead(
        @ActiveUser('userId') userId: number,
        @Param('fromUserId') fromUserId: string,
    ): Promise<{ message: string }> {
        return this.messageService.markConversationAsRead(userId, parseInt(fromUserId));
    }
}