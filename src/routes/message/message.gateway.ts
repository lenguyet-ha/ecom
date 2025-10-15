import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    ConnectedSocket,
    MessageBody,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { MessageService } from './message.service';
import { PrismaService } from 'src/shared/services/prisma.service';
import {
    WebSocketJoinRoomType,
    WebSocketMessageEventType,
} from './message.dto';
import type { WebSocketSendMessageType } from './message.dto';
import { JwtService } from '@nestjs/jwt';

// Interface để type-safe socket với user data
interface AuthenticatedSocket extends Socket {
    userId?: number;
    userName?: string;
}

@WebSocketGateway({
    namespace: 'messages',
    cors: {
        origin: [
            'http://localhost:3001',
             'http://localhost:3000',
            'http://localhost:7030',
            'http://127.0.0.1:5500', // Live Server
            'http://localhost:5500',
            'http://localhost:8080',
            'file://', // Cho phép file:// protocol
        ],
        credentials: true,
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    },
})
export class MessageGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(MessageGateway.name);

    constructor(
        private readonly messageService: MessageService,
        private readonly prismaService: PrismaService,
        private readonly jwtService: JwtService,
    ) {}

    async handleConnection(client: AuthenticatedSocket) {
        try {
            // Authenticate user từ token trong handshake
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            
            if (!token) {
                this.logger.warn(`Client ${client.id} connected without token`);
                client.disconnect();
                return;
            }

            // Verify JWT token
            const payload = this.jwtService.verify(token);
            const userId = payload.sub || payload.userId;

            if (!userId) {
                this.logger.warn(`Invalid token for client ${client.id}`);
                client.disconnect();
                return;
            }

            // Lấy thông tin user từ database
            const user = await this.prismaService.user.findUnique({
                where: { id: userId, deletedAt: null },
                select: { id: true, name: true },
            });

            if (!user) {
                this.logger.warn(`User ${userId} not found for client ${client.id}`);
                client.disconnect();
                return;
            }

            // Gán thông tin user vào socket
            client.userId = user.id;
            client.userName = user.name;

            // Lưu websocket connection vào database
            await this.prismaService.websocket.create({
                data: {
                    id: client.id,
                    userId: user.id,
                },
            });

            // Join user vào room riêng của họ để nhận tin nhắn
            await client.join(`user_${user.id}`);

            this.logger.log(`🔌 User ${user.name} (${user.id}) connected with socket ${client.id}`);
            
            // Emit connection success event
            client.emit('connected', { 
                message: 'Connected successfully', 
                userId: user.id,
                userName: user.name 
            });
        } catch (error) {
            this.logger.error(`Authentication failed for client ${client.id}:`, error.message);
            client.disconnect();
        }
    }

    async handleDisconnect(client: AuthenticatedSocket) {
        try {
            // Xóa websocket connection khỏi database
            await this.prismaService.websocket.delete({
                where: { id: client.id },
            });

            this.logger.log(`User ${client.userName} (${client.userId}) disconnected socket ${client.id}`);
        } catch (error) {
            this.logger.error(`Error handling disconnect for client ${client.id}:`, error.message);
        }
    }

    @SubscribeMessage('join_conversation')
    async handleJoinConversation(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { otherUserId: number },
    ) {
        try {
            if (!client.userId) return;

            const { otherUserId } = data;
            
            // Tạo room name dựa trên userId (sorted để đảm bảo consistency)
            const roomName = this.createRoomName(client.userId, otherUserId);
            
            // Join room
            await client.join(roomName);
            
            this.logger.log(`User ${client.userId} joined conversation room: ${roomName}`);
            
            // Emit confirmation
            client.emit('joined_conversation', { 
                otherUserId, 
                roomName,
                message: 'Successfully joined conversation' 
            });
        } catch (error) {
            this.logger.error(`Error joining conversation:`, error.message);
            client.emit('error', { message: 'Failed to join conversation' });
        }
    }

    @SubscribeMessage('leave_conversation')
    async handleLeaveConversation(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { otherUserId: number },
    ) {
        try {
            if (!client.userId) return;

            const { otherUserId } = data;
            const roomName = this.createRoomName(client.userId, otherUserId);
            
            await client.leave(roomName);
            
            this.logger.log(`User ${client.userId} left conversation room: ${roomName}`);
            
            client.emit('left_conversation', { 
                otherUserId, 
                roomName,
                message: 'Successfully left conversation' 
            });
        } catch (error) {
            this.logger.error(`Error leaving conversation:`, error.message);
            client.emit('error', { message: 'Failed to leave conversation' });
        }
    }

    @SubscribeMessage('send_message')
    async handleSendMessage(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: WebSocketSendMessageType,
    ) {
        this.logger.log(`📤 Send message from user ${client.userId} to user ${data.toUserId}: "${data.content}"`);
        
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            // Gửi tin nhắn qua service (lưu vào database)
            const result = await this.messageService.sendMessage(client.userId, {
                toUserId: data.toUserId,
                content: data.content,
            });

            // Tạo room name cho cuộc hội thoại
            const roomName = this.createRoomName(client.userId, data.toUserId);
            
            // Prepare message event data
            const messageEvent: WebSocketMessageEventType = {
                event: 'message',
                data: result.data,
            };

            // Emit tin nhắn đến tất cả client trong room (bao gồm người gửi)
            this.server.to(roomName).emit('new_message', messageEvent);
            
            // Emit riêng cho user nhận (trường hợp họ không ở trong conversation room)
            this.server.to(`user_${data.toUserId}`).emit('message_notification', {
                fromUserId: client.userId,
                fromUserName: client.userName,
                message: result.data,
            });

            this.logger.log(`Message sent from user ${client.userId} to user ${data.toUserId}`);
        } catch (error) {
            this.logger.error(`Error sending message:`, error.message);
            client.emit('error', { message: 'Failed to send message: ' + error.message });
        }
    }

    @SubscribeMessage('mark_as_read')
    async handleMarkAsRead(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { fromUserId: number },
    ) {
        try {
            if (!client.userId) {
                client.emit('error', { message: 'Unauthorized' });
                return;
            }

            // Đánh dấu conversation là đã đọc
            await this.messageService.markConversationAsRead(client.userId, data.fromUserId);
            
            // Thông báo cho người gửi tin rằng tin nhắn đã được đọc
            this.server.to(`user_${data.fromUserId}`).emit('messages_read', {
                readByUserId: client.userId,
                readByUserName: client.userName,
                readAt: new Date().toISOString(),
            });

            client.emit('marked_as_read', { 
                fromUserId: data.fromUserId,
                message: 'Messages marked as read' 
            });

            this.logger.log(`User ${client.userId} marked messages from user ${data.fromUserId} as read`);
        } catch (error) {
            this.logger.error(`Error marking messages as read:`, error.message);
            client.emit('error', { message: 'Failed to mark messages as read' });
        }
    }

    @SubscribeMessage('typing')
    handleTyping(
        @ConnectedSocket() client: AuthenticatedSocket,
        @MessageBody() data: { toUserId: number; isTyping: boolean },
    ) {
        try {
            if (!client.userId) return;

            const roomName = this.createRoomName(client.userId, data.toUserId);
            
            // Emit typing indicator chỉ cho user khác trong room
            client.to(roomName).emit('user_typing', {
                userId: client.userId,
                userName: client.userName,
                isTyping: data.isTyping,
            });

            // Cũng emit riêng cho user nhận
            this.server.to(`user_${data.toUserId}`).emit('user_typing', {
                userId: client.userId,
                userName: client.userName,
                isTyping: data.isTyping,
            });
        } catch (error) {
            this.logger.error(`Error handling typing indicator:`, error.message);
        }
    }

    // Helper method để tạo room name consistent
    private createRoomName(userId1: number, userId2: number): string {
        const [smallerId, largerId] = [userId1, userId2].sort((a, b) => a - b);
        return `conversation_${smallerId}_${largerId}`;
    }

    // Public method để gửi notification từ bên ngoài (ví dụ: từ REST API)
    sendNotificationToUser(userId: number, notification: any) {
        this.server.to(`user_${userId}`).emit('notification', notification);
    }

    // Public method để gửi message real-time từ bên ngoài
    broadcastMessage(fromUserId: number, toUserId: number, messageData: any) {
        const roomName = this.createRoomName(fromUserId, toUserId);
        this.server.to(roomName).emit('new_message', {
            event: 'message',
            data: messageData,
        });
    }
}