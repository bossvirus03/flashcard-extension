import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { ReviewService } from "./review.service";
import { CreateReviewDto } from "./dto/review.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RequestWithUser } from "@/auth/dto/auth.dto";

@Controller("reviews")
@UseGuards(JwtAuthGuard)
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}
  @Get('cards')
  async getReviewCards(
    @Request() req: RequestWithUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.reviewService.getReviewCards(req.user.id, limit);
  }

  @Post()
  async createReview(
    @Request() req: RequestWithUser,
    @Body() createReviewDto: CreateReviewDto,
  ) {
    return this.reviewService.createReview(req.user.id, createReviewDto);
  }

  @Post('reset')
  async resetProgress(@Request() req: RequestWithUser) {
    return this.reviewService.resetUserProgress(req.user.id);
  }

  @Get('today-stats')
  async getTodayStats(@Request() req: RequestWithUser) {
    return this.reviewService.getTodayStats(req.user.id);
  }
}
