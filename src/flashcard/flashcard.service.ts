import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";
import { CreateFlashcardDto, UpdateFlashcardDto } from "./dto/flashcard.dto";

@Injectable()
export class FlashcardService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createFlashcardDto: CreateFlashcardDto) {
    return this.prisma.flashcard.create({
      data: {
        ...createFlashcardDto,
        userId,
      },
    });
  }

  async getPracticeCards(userId: string, limit: number = 20) {
    const allCards = await this.prisma.flashcard.findMany({
      where: { userId },
      select: {
        id: true,
        front: true,
        back: true,
      },
    });

    // Shuffle ngẫu nhiên
    return this.shuffleArray(allCards).slice(0, limit);
  }

  private shuffleArray<T>(array: T[]): T[] {
    return [...array].sort(() => Math.random() - 0.5);
  }
  async findAll(userId: string, deckId?: string) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
        ...(deckId && { deckId }),
      },
      include: {
        reviews: {
          orderBy: {
            reviewedAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: {
            reviewedAt: "desc",
          },
        },
      },
    });
  }

  async update(
    id: string,
    userId: string,
    updateFlashcardDto: UpdateFlashcardDto,
  ) {
    // Verify ownership
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    if (!flashcard || flashcard.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return this.prisma.flashcard.update({
      where: { id },
      data: updateFlashcardDto,
    });
  }

  async remove(id: string, userId: string) {
    const flashcard = await this.prisma.flashcard.findUnique({
      where: { id },
    });

    if (!flashcard || flashcard.userId !== userId) {
      throw new Error("Unauthorized");
    }

    return this.prisma.flashcard.delete({
      where: { id },
    });
  }

  async getDueCards(userId: string, limit: number = 20) {
    const now = new Date();

    return this.prisma.flashcard.findMany({
      where: {
        userId,
        repetitions: {
          gt: 0,
        },
        nextReviewDate: {
          lte: now,
        },
      },
      orderBy: {
        nextReviewDate: "asc",
      },
      take: limit,
    });
  }

  async getStats(userId: string) {
    const total = await this.prisma.flashcard.count({ where: { userId } });

    const learned = await this.prisma.flashcard.count({
      where: {
        userId,
        gotItCount: { gte: 7 },
      },
    });

    const toReview = await this.prisma.flashcard.count({
      where: {
        userId,
        OR: [
          { gotItCount: { lt: 7 } },
          { gotItCount: { equals: undefined } }, // quan trọng: xử lý thẻ cũ
        ],
      },
    });

    return {
      total,
      learned,
      toReview,
    };
  }
}
