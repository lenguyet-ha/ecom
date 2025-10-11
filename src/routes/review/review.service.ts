import { Injectable } from '@nestjs/common';
import { ReviewRepository } from 'src/shared/repositories/review.repo';
import {
    CreateReviewBodyType,
    CreateReviewResType,
    GetReviewsByOrderResType,
    GetReviewsByProductQueryType,
    GetReviewsResType,
    ReviewDetailType,
    UpdateReviewBodyType,
} from './review.dto';

@Injectable()
export class ReviewService {
    constructor(private readonly reviewRepository: ReviewRepository) {}

    async create(userId: number, body: CreateReviewBodyType): Promise<CreateReviewResType> {
        return this.reviewRepository.create(userId, body);
    }

    async getByProduct(query: GetReviewsByProductQueryType): Promise<GetReviewsResType> {
        return this.reviewRepository.getByProduct(query);
    }

    async getByOrder(orderId: number): Promise<GetReviewsByOrderResType> {
        return this.reviewRepository.getByOrder(orderId);
    }
}
