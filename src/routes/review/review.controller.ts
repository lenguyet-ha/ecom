import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import { ReviewService } from './review.service';
import { ActiveUser } from 'src/shared/decorators/active-user.decorator';
import {
    CreateReviewBodyDTO,
    CreateReviewResDTO,
    GetReviewParamsDTO,
    GetReviewsByOrderQueryDTO,
    GetReviewsByOrderResDTO,
    GetReviewsByProductQueryDTO,
    GetReviewsResDTO,
    ReviewDetailDTO,
    UpdateReviewBodyDTO,
} from './review.dto';

@Controller('reviews')
export class ReviewController {
    constructor(private readonly reviewService: ReviewService) {}

    @Post()
    create(@ActiveUser('userId') userId: number, @Body() body: CreateReviewBodyDTO): Promise<CreateReviewResDTO> {
        return this.reviewService.create(userId, body);
    }

    @Get()
    getByProduct(@Query() query: GetReviewsByProductQueryDTO): Promise<GetReviewsResDTO> {
        return this.reviewService.getByProduct(query);
    }

    @Get('order/:orderId')
    getByOrder(@Param() param: GetReviewsByOrderQueryDTO): Promise<GetReviewsByOrderResDTO> {
        return this.reviewService.getByOrder(param.orderId);
    }
}
