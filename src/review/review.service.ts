import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateReviewDto } from "./dto/review.dto";

@Injectable()
export class ReviewService {
  constructor(private readonly prisma: PrismaService) {}

  async createReview(userId: string, dto: CreateReviewDto) {
    const { flashcardId, isGotIt, lessonId } = dto;

    return this.prisma.$transaction(async (tx) => {
      const flashcard = await tx.flashcard.findUnique({
        where: { id: flashcardId },
      });

      if (!flashcard || flashcard.userId !== userId) {
        throw new Error("Flashcard not found or unauthorized");
      }

      // Cập nhật gotItCount theo yêu cầu
      const newGotItCount = isGotIt ? Math.min(7, flashcard.gotItCount + 1) : 0; // Study Again → reset về 0

      const updatedFlashcard = await tx.flashcard.update({
        where: { id: flashcardId },
        data: {
          gotItCount: newGotItCount,
          lastReviewedAt: new Date(),
        },
      });

      // Nếu có lesson thì advance index
      const updatedLesson = lessonId
        ? await this.advanceLesson(tx, userId, lessonId, flashcardId)
        : null;

      return {
        flashcard: updatedFlashcard,
        lesson: updatedLesson,
        gotItCount: newGotItCount,
      };
    });
  }

  private async advanceLesson(
    tx: any,
    userId: string,
    lessonId: string,
    flashcardId: string,
  ) {
    const lesson = await tx.lesson.findFirst({
      where: {
        id: lessonId,
        userId,
        completedAt: null,
      },
    });

    if (!lesson) {
      return null;
    }

    const currentFlashcardId = lesson.flashcardIds[lesson.currentIndex];
    if (currentFlashcardId !== flashcardId) {
      return lesson;
    }

    const nextIndex = lesson.currentIndex + 1;
    const isCompleted = nextIndex >= lesson.flashcardIds.length;

    return tx.lesson.update({
      where: { id: lesson.id },
      data: {
        currentIndex: Math.min(nextIndex, lesson.flashcardIds.length),
        lastAccessedAt: new Date(),
        ...(isCompleted ? { completedAt: new Date() } : {}),
      },
    });
  }

  // Lấy cards để Review: chỉ lấy những card chưa thuộc (gotItCount < 7)
  // Thay thế phương thức getReviewCards cũ bằng đoạn này
  async getReviewCards(userId: string, limit: number = 20) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
        // Lấy tất cả thẻ có gotItCount < 7 HOẶC gotItCount là null (thẻ cũ)
        OR: [{ gotItCount: { lt: 7 } }, { gotItCount: undefined }],
      },
      select: {
        id: true,
        front: true,
        back: true,
        gotItCount: true,
      },
      orderBy: { createdAt: "desc" },
      take: limit,
    });
  }

  // Reset toàn bộ tiến độ
  async resetUserProgress(userId: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.review.deleteMany({ where: { userId } });

      await tx.flashcard.updateMany({
        where: { userId },
        data: {
          gotItCount: 0,
          interval: 1,
          easeFactor: 2.5,
          repetitions: 0,
          nextReviewDate: new Date(),
          lastReviewedAt: null,
        },
      });

      return { success: true };
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
      select: { quality: true },
    });

    const totalReviews = reviews.length;
    const correctReviews = reviews.filter((r) => r.quality >= 3).length;
    const accuracy =
      totalReviews > 0 ? Math.round((correctReviews / totalReviews) * 100) : 0;

    return { totalReviews, correctReviews, accuracy };
  }
}
