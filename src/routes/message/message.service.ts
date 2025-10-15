import { Injectable } from '@nestjs/common';
import { MessageRepository } from 'src/shared/repositories/message.repo';
import {
    GetConversationsQueryType,
    GetConversationsResType,
    GetMessagesQueryType,
    GetMessagesResType,
    GetUnreadCountResType,
    MarkAsReadBodyType,
    SendMessageBodyType,
    SendMessageResType,
} from './message.dto';

@Injectable()
export class MessageService {
    constructor(private readonly messageRepository: MessageRepository) {}

    async sendMessage(fromUserId: number, body: SendMessageBodyType): Promise<SendMessageResType> {
        return this.messageRepository.sendMessage(fromUserId, body);
    }

    async getConversations(userId: number, query: GetConversationsQueryType): Promise<GetConversationsResType> {
        return this.messageRepository.getConversations(userId, query);
    }

    async getMessages(userId: number, query: GetMessagesQueryType): Promise<GetMessagesResType> {
        return this.messageRepository.getMessages(userId, query);
    }

    async getUnreadCount(userId: number): Promise<GetUnreadCountResType> {
        return this.messageRepository.getUnreadCount(userId);
    }

    async markAsRead(userId: number, body: MarkAsReadBodyType): Promise<{ message: string }> {
        return this.messageRepository.markAsRead(userId, body);
    }

    async markConversationAsRead(userId: number, fromUserId: number): Promise<{ message: string }> {
        return this.messageRepository.markConversationAsRead(userId, fromUserId);
    }
}