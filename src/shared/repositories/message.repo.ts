import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    GetConversationsQueryType,
    GetConversationsResType,
    GetMessagesQueryType,
    GetMessagesResType,
    GetUnreadCountResType,
    MarkAsReadBodyType,
    MessageDetailType,
    SendMessageBodyType,
    SendMessageResType,
} from 'src/routes/message/message.dto';
import {
    CannotSendMessageToSelfException,
    ConversationNotFoundException,
    MessageNotFoundException,
    UnauthorizedMessageAccessException,
    UserNotFoundException,
} from 'src/routes/message/message.error';
import { Prisma } from '@prisma/client';

@Injectable()
export class MessageRepository {
    constructor(private readonly prismaService: PrismaService) {}

    async sendMessage(fromUserId: number, body: SendMessageBodyType): Promise<SendMessageResType> {
        // 1. Kiểm tra không thể gửi tin nhắn cho chính mình
        if (fromUserId === body.toUserId) {
            throw CannotSendMessageToSelfException;
        }

        // 2. Kiểm tra user nhận có tồn tại không
        const toUser = await this.prismaService.user.findUnique({
            where: { id: body.toUserId, deletedAt: null },
            select: { id: true, name: true, avatar: true },
        });

        if (!toUser) {
            throw UserNotFoundException;
        }

        // 3. Lấy thông tin user gửi
        const fromUser = await this.prismaService.user.findUnique({
            where: { id: fromUserId, deletedAt: null },
            select: { id: true, name: true, avatar: true },
        });

        if (!fromUser) {
            throw UserNotFoundException;
        }

        // 4. Tạo tin nhắn
        const message = await this.prismaService.message.create({
            data: {
                fromUserId,
                toUserId: body.toUserId,
                content: body.content,
            },
        });

        return {
            message: 'Message sent successfully',
            data: {
                id: message.id,
                fromUserId: message.fromUserId,
                toUserId: message.toUserId,
                content: message.content,
                readAt: message.readAt,
                createdAt: message.createdAt,
                fromUser,
                toUser,
            } as any,
        };
    }

    async getConversations(userId: number, query: GetConversationsQueryType): Promise<GetConversationsResType> {
        const { page, limit } = query;
        // Đảm bảo page và limit là number
        const pageNum = Number(page);
        const limitNum = Number(limit);
        const skip = (pageNum - 1) * limitNum;

        // Lấy danh sách user đã nhắn tin (cả gửi và nhận)
        const conversations = await this.prismaService.$queryRaw<any[]>`
            SELECT 
                CASE 
                    WHEN m."fromUserId" = ${userId} THEN m."toUserId" 
                    ELSE m."fromUserId" 
                END as user_id,
                u.name,
                u.avatar,
                MAX(m."createdAt") as last_message_time
            FROM "Message" m
            JOIN "User" u ON (
                CASE 
                    WHEN m."fromUserId" = ${userId} THEN u.id = m."toUserId"
                    ELSE u.id = m."fromUserId"
                END
            )
            WHERE (m."fromUserId" = ${userId} OR m."toUserId" = ${userId})
                AND u."deletedAt" IS NULL
            GROUP BY user_id, u.name, u.avatar
            ORDER BY last_message_time DESC
            LIMIT ${limitNum} OFFSET ${skip}
        `;

        // Lấy tin nhắn cuối cùng và đếm unread cho mỗi conversation
        const conversationData = await Promise.all(
            conversations.map(async (conv) => {
                const [lastMessage, unreadCount] = await Promise.all([
                    this.prismaService.message.findFirst({
                        where: {
                            OR: [
                                { fromUserId: userId, toUserId: conv.user_id },
                                { fromUserId: conv.user_id, toUserId: userId },
                            ],
                        },
                        orderBy: { createdAt: 'desc' },
                    }),
                    this.prismaService.message.count({
                        where: {
                            fromUserId: conv.user_id,
                            toUserId: userId,
                            readAt: null,
                        },
                    }),
                ]);

                return {
                    user: {
                        id: conv.user_id,
                        name: conv.name,
                        avatar: conv.avatar,
                    },
                    lastMessage: lastMessage
                        ? {
                              id: lastMessage.id,
                              fromUserId: lastMessage.fromUserId,
                              toUserId: lastMessage.toUserId,
                              content: lastMessage.content,
                              readAt: lastMessage.readAt,
                              createdAt: lastMessage.createdAt,
                          }
                        : null,
                    unreadCount,
                };
            }),
        );

        // Đếm tổng số conversations
        const totalItems = await this.prismaService.$queryRaw<[{ count: bigint }]>`
            SELECT COUNT(DISTINCT 
                CASE 
                    WHEN m."fromUserId" = ${userId} THEN m."toUserId" 
                    ELSE m."fromUserId" 
                END
            ) as count
            FROM "Message" m
            JOIN "User" u ON (
                CASE 
                    WHEN m."fromUserId" = ${userId} THEN u.id = m."toUserId"
                    ELSE u.id = m."fromUserId"
                END
            )
            WHERE (m."fromUserId" = ${userId} OR m."toUserId" = ${userId})
                AND u."deletedAt" IS NULL
        `;

        const total = Number(totalItems[0].count);

        return {
            data: conversationData as any,
            totalItems: total,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(total / limitNum),
        };
    }

    async getMessages(userId: number, query: GetMessagesQueryType): Promise<GetMessagesResType> {
        const { userId: otherUserId, page, limit } = query;
        // Đảm bảo page và limit là number
        const pageNum = Number(page) || 1;
        const limitNum = Number(limit) || 50;
        const skip = Math.max(0, (pageNum - 1) * limitNum);

        // Debug: Kiểm tra tất cả users trong database
        const allUsers = await this.prismaService.user.findMany({
            where: { deletedAt: null },
            select: { id: true, name: true, email: true },
            take: 10,
        });

        const otherUser = await this.prismaService.user.findUnique({
            where: { id: otherUserId, deletedAt: null },
        });

        if (!otherUser) {
            throw UserNotFoundException;
        }

        const where: Prisma.MessageWhereInput = {
            OR: [
                { fromUserId: userId, toUserId: otherUserId },
                { fromUserId: otherUserId, toUserId: userId },
            ],
        };

        const [messages, totalItems] = await Promise.all([
            this.prismaService.message.findMany({
                where,
                include: {
                    fromUser: {
                        select: { id: true, name: true, avatar: true },
                    },
                    toUser: {
                        select: { id: true, name: true, avatar: true },
                    },
                },
                orderBy: { createdAt: 'desc' },
                skip: Number(skip) || 0,
                take: Number(limitNum) || 50,
            }),
            this.prismaService.message.count({ where }),
        ]);

        return {
            data: messages.reverse() as any, // Reverse để hiển thị tin nhắn cũ lên đầu
            totalItems,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(totalItems / limitNum),
        };
    }

    async getUnreadCount(userId: number): Promise<GetUnreadCountResType> {
        // Đếm tổng tin nhắn chưa đọc
        const totalUnreadCount = await this.prismaService.message.count({
            where: {
                toUserId: userId,
                readAt: null,
            },
        });

        // Đếm theo từng conversation
        const conversationCounts = await this.prismaService.$queryRaw<any[]>`
            SELECT 
                "fromUserId" as user_id,
                COUNT(*) as count
            FROM "Message"
            WHERE "toUserId" = ${userId} AND "readAt" IS NULL
            GROUP BY "fromUserId"
        `;

        return {
            totalUnreadCount,
            conversationCounts: conversationCounts.map((item) => ({
                userId: item.user_id,
                count: Number(item.count),
            })),
        };
    }

    async markAsRead(userId: number, body: MarkAsReadBodyType): Promise<{ message: string }> {
        // Kiểm tra tất cả messageIds có thuộc về user không (là người nhận)
        const messages = await this.prismaService.message.findMany({
            where: {
                id: { in: body.messageIds },
                toUserId: userId,
            },
        });

        if (messages.length !== body.messageIds.length) {
            throw MessageNotFoundException;
        }

        // Cập nhật readAt
        await this.prismaService.message.updateMany({
            where: {
                id: { in: body.messageIds },
                toUserId: userId,
                readAt: null, // Chỉ update những tin nhắn chưa đọc
            },
            data: {
                readAt: new Date(),
            },
        });

        return { message: 'Messages marked as read successfully' };
    }

    async markConversationAsRead(userId: number, fromUserId: number): Promise<{ message: string }> {
        // Đánh dấu tất cả tin nhắn từ fromUserId đến userId là đã đọc
        await this.prismaService.message.updateMany({
            where: {
                fromUserId,
                toUserId: userId,
                readAt: null,
            },
            data: {
                readAt: new Date(),
            },
        });

        return { message: 'Conversation marked as read successfully' };
    }
}
