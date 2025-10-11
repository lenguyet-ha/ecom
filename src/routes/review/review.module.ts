import { Module } from '@nestjs/common';
import { ReviewController } from './review.controller';
import { ReviewService } from './review.service';
import { ReviewRepository } from 'src/shared/repositories/review.repo';
import { SharedModule } from 'src/shared/shared.module';

@Module({
    imports: [SharedModule],
    controllers: [ReviewController],
    providers: [ReviewService, ReviewRepository],
})
export class ReviewModule {}
