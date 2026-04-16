import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Param,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('reviews')
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Post()
  async createReview(
    @Request() req: ExpressRequest,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview((req as any).user.id, createReviewDto);
  }

  @Get('history/:flashcardId')
  async getHistory(
    @Request() req: ExpressRequest,
    @Param('flashcardId') flashcardId: string,
  ) {
    return this.reviewService.getReviewHistory((req as any).user.id, flashcardId);
  }

  @Get('stats/today')
  async getTodayStats(@Request() req: ExpressRequest) {
    return this.reviewService.getTodayStats((req as any).user.id);
  }
}
