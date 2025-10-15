import { HttpException, HttpStatus } from '@nestjs/common';

export const UserNotFoundException = new HttpException('User not found', HttpStatus.NOT_FOUND);

export const MessageNotFoundException = new HttpException('Message not found', HttpStatus.NOT_FOUND);

export const CannotSendMessageToSelfException = new HttpException(
    'Cannot send message to yourself',
    HttpStatus.BAD_REQUEST,
);

export const UnauthorizedMessageAccessException = new HttpException(
    'You are not authorized to access this message',
    HttpStatus.FORBIDDEN,
);

export const ConversationNotFoundException = new HttpException(
    'Conversation not found',
    HttpStatus.NOT_FOUND,
);