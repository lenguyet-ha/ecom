import { HttpException, HttpStatus } from '@nestjs/common';

export const ReviewNotFoundException = new HttpException('Review not found', HttpStatus.NOT_FOUND);

export const OrderNotFoundException = new HttpException('Order not found', HttpStatus.NOT_FOUND);

export const OrderNotDeliveredException = new HttpException(
    'Cannot review order that has not been delivered',
    HttpStatus.BAD_REQUEST,
);

export const ReviewAlreadyExistsException = new HttpException(
    'You have already reviewed this product in this order',
    HttpStatus.BAD_REQUEST,
);

export const UnauthorizedReviewAccessException = new HttpException(
    'You are not authorized to access this review',
    HttpStatus.FORBIDDEN,
);

export const MaxUpdateReviewExceededException = new HttpException(
    'You have exceeded the maximum number of review updates (3 times)',
    HttpStatus.BAD_REQUEST,
);

export const ProductNotInOrderException = new HttpException(
    'Product is not in the order',
    HttpStatus.BAD_REQUEST,
);
