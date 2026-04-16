import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateReviewDto } from './dto/review.dto';

/**
 * SM-2 Algorithm for Spaced Repetition
 * Based on https://en.wikipedia.org/wiki/Spaced_repetition#SM-2
 */
@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, createReviewDto: CreateReviewDto) {
    const { flashcardId, quality } = createReviewDto;

    // Get the flashcard
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id: flashcardId },
    });

    if (!flashcard || flashcard.userId !== userId) {
      throw new Error('Flashcard not found');
    }

    // Create the review entry
    await this.prisma.review.create({
      data: {
        userId,
        flashcardId,
        quality,
      },
    });

    // Calculate new SM-2 values
    const updatedValues = this.calculateSM2(
      flashcard.easeFactor,
      flashcard.interval,
      flashcard.repetitions,
      quality,
    );

    // Update flashcard with new spaced repetition values
    const nextReviewDate = this.getNextReviewDate(updatedValues.interval);

    const updated = await this.prisma.flashcard.update({
      where: { id: flashcardId },
      data: {
        easeFactor: updatedValues.easeFactor,
        interval: updatedValues.interval,
        repetitions: updatedValues.repetitions,
        nextReviewDate,
        lastReviewedAt: new Date(),
      },
    });

    return {
      review: { userId, flashcardId, quality },
      flashcard: updated,
    };
  }

  /**
    * Improved SM-2 style scheduling
    * Quality mapping:
    * 0-2: Again (forgot)
    * 3: Hard
    * 4: Good
    * 5: Easy
   * @param currentEF Current ease factor
   * @param currentInterval Current interval in days
   * @param currentReps Current number of repetitions
   * @param quality Quality of response (0-5)
   */
  private calculateSM2(
    currentEF: number,
    currentInterval: number,
    currentReps: number,
    quality: number,
  ) {
    const normalizedQuality = Math.min(5, Math.max(0, Math.round(quality)));

    // Again: forgot this card, reset repetition and bring it back soon
    if (normalizedQuality <= 2) {
      return {
        easeFactor: this.clampEaseFactor(currentEF - 0.2),
        interval: 1,
        repetitions: 0,
      };
    }

    // Hard / Good / Easy ease-factor adjustments
    let easeDelta = 0;
    if (normalizedQuality === 3) {
      easeDelta = -0.15;
    } else if (normalizedQuality === 5) {
      easeDelta = 0.15;
    }

    const nextEaseFactor = this.clampEaseFactor(currentEF + easeDelta);

    // Learning steps for early reps to stabilize memory.
    const nextRepetitions = currentReps + 1;
    let nextInterval: number;
    if (nextRepetitions === 1) {
      nextInterval = normalizedQuality === 3 ? 1 : normalizedQuality === 4 ? 2 : 3;
    } else if (nextRepetitions === 2) {
      nextInterval = normalizedQuality === 3 ? 3 : normalizedQuality === 4 ? 5 : 7;
    } else {
      const qualityMultiplier =
        normalizedQuality === 3 ? 0.85 : normalizedQuality === 4 ? 1 : 1.25;
      const multipliedInterval = currentInterval * nextEaseFactor * qualityMultiplier;
      nextInterval = Math.max(1, Math.round(multipliedInterval));
    }

    return {
      easeFactor: Math.round(nextEaseFactor * 100) / 100,
      interval: nextInterval,
      repetitions: nextRepetitions,
    };
  }

  private clampEaseFactor(value: number) {
    return Math.min(3.0, Math.max(1.3, value));
  }

  private getNextReviewDate(intervalInDays: number) {
    const next = new Date();
    next.setDate(next.getDate() + Math.max(1, intervalInDays));

    // Schedule at a consistent hour to reduce noisy due times.
    next.setHours(8, 0, 0, 0);
    return next;
  }

  async getReviewHistory(userId: string, flashcardId: string) {
    return this.prisma.review.findMany({
      where: {
        userId,
        flashcardId,
      },
      orderBy: {
        reviewedAt: 'desc',
      },
    });
  }

  async getTodayStats(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const reviews = await this.prisma.review.findMany({
      where: {
        userId,
        reviewedAt: {
          gte: today,
          lt: tomorrow,
        },
      },
    });

    const totalReviews = reviews.length;
    const correctReviews = reviews.filter((r) => r.quality >= 3).length;
    const accuracy =
      totalReviews > 0
        ? Math.round((correctReviews / totalReviews) * 100)
        : 0;

    return {
      totalReviews,
      correctReviews,
      accuracy,
    };
  }
}
