import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

export const MessageSchema = z.object({
    id: z.number(),
    fromUserId: z.number(),
    toUserId: z.number(),
    content: z.string(),
    readAt: z.date().nullable(),
    createdAt: z.date(),
});

// Schema cho gửi tin nhắn
export const SendMessageBodySchema = z.object({
    toUserId: z.number().int().positive(),
    content: z.string().trim().min(1).max(5000),
});

// Schema cho danh sách cuộc hội thoại
export const GetConversationsQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(20),
});

// Schema cho lấy tin nhắn trong cuộc hội thoại
export const GetMessagesQuerySchema = z.object({
    userId: z.coerce.number().int().positive(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().default(50),
});

// Schema cho đánh dấu đã đọc
export const MarkAsReadBodySchema = z.object({
    messageIds: z.array(z.number().int().positive()).min(1),
});

// Schema cho user trong conversation
export const ConversationUserSchema = z.object({
    id: z.number(),
    name: z.string(),
    avatar: z.string().nullable(),
});

// Schema cho cuộc hội thoại
export const ConversationSchema = z.object({
    user: ConversationUserSchema,
    lastMessage: MessageSchema.nullable(),
    unreadCount: z.number(),
});

// Schema cho tin nhắn với thông tin user
export const MessageDetailSchema = MessageSchema.extend({
    fromUser: ConversationUserSchema,
    toUser: ConversationUserSchema,
});

// Schema cho response
export const GetConversationsResSchema = z.object({
    data: z.array(ConversationSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const GetMessagesResSchema = z.object({
    data: z.array(MessageDetailSchema),
    totalItems: z.number(),
    page: z.number(),
    limit: z.number(),
    totalPages: z.number(),
});

export const SendMessageResSchema = z.object({
    message: z.string(),
    data: MessageDetailSchema,
});

export const GetUnreadCountResSchema = z.object({
    totalUnreadCount: z.number(),
    conversationCounts: z.array(z.object({
        userId: z.number(),
        count: z.number(),
    })),
});

// WebSocket event schemas
export const WebSocketJoinRoomSchema = z.object({
    room: z.string(), // Format: "user_{userId1}_user_{userId2}" (sorted by userId)
});

export const WebSocketSendMessageSchema = z.object({
    toUserId: z.number().int().positive(),
    content: z.string().trim().min(1).max(5000),
});

export const WebSocketMessageEventSchema = z.object({
    event: z.literal('message'),
    data: MessageDetailSchema,
});

// Types
export type MessageType = z.infer<typeof MessageSchema>;
export type SendMessageBodyType = z.infer<typeof SendMessageBodySchema>;
export type GetConversationsQueryType = z.infer<typeof GetConversationsQuerySchema>;
export type GetMessagesQueryType = z.infer<typeof GetMessagesQuerySchema>;
export type MarkAsReadBodyType = z.infer<typeof MarkAsReadBodySchema>;
export type ConversationUserType = z.infer<typeof ConversationUserSchema>;
export type ConversationType = z.infer<typeof ConversationSchema>;
export type MessageDetailType = z.infer<typeof MessageDetailSchema>;
export type GetConversationsResType = z.infer<typeof GetConversationsResSchema>;
export type GetMessagesResType = z.infer<typeof GetMessagesResSchema>;
export type SendMessageResType = z.infer<typeof SendMessageResSchema>;
export type GetUnreadCountResType = z.infer<typeof GetUnreadCountResSchema>;
export type WebSocketJoinRoomType = z.infer<typeof WebSocketJoinRoomSchema>;
export type WebSocketSendMessageType = z.infer<typeof WebSocketSendMessageSchema>;
export type WebSocketMessageEventType = z.infer<typeof WebSocketMessageEventSchema>;

// DTOs
export class SendMessageBodyDTO extends createZodDto(SendMessageBodySchema) {}
export class GetConversationsQueryDTO extends createZodDto(GetConversationsQuerySchema) {}
export class GetMessagesQueryDTO extends createZodDto(GetMessagesQuerySchema) {}
export class MarkAsReadBodyDTO extends createZodDto(MarkAsReadBodySchema) {}
export class GetConversationsResDTO extends createZodDto(GetConversationsResSchema) {}
export class GetMessagesResDTO extends createZodDto(GetMessagesResSchema) {}
export class SendMessageResDTO extends createZodDto(SendMessageResSchema) {}
export class GetUnreadCountResDTO extends createZodDto(GetUnreadCountResSchema) {}