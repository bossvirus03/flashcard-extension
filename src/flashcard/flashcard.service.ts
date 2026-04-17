import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import {
  CreateFlashcardDto,
  UpdateFlashcardDto,
} from './dto/flashcard.dto';

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

  async findAll(userId: string, deckId?: string) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
        ...(deckId && { deckId }),
      },
      include: {
        reviews: {
          orderBy: {
            reviewedAt: 'desc',
          },
          take: 1,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.flashcard.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: {
            reviewedAt: 'desc',
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
      throw new Error('Unauthorized');
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
      throw new Error('Unauthorized');
    }

    return this.prisma.flashcard.delete({
      where: { id },
    });
  }

  async getDueCards(userId: string, limit: number = 20) {
    return this.prisma.flashcard.findMany({
      where: {
        userId,
        nextReviewDate: {
          lte: new Date(),
        },
      },
      orderBy: {
        nextReviewDate: 'asc',
      },
      take: limit,
    });
  }

  async getStats(userId: string) {
    const total = await this.prisma.flashcard.count({
      where: { userId },
    });

    const dueToday = await this.prisma.flashcard.count({
      where: {
        userId,
        nextReviewDate: {
          lte: new Date(),
        },
      },
    });

    const learned = await this.prisma.flashcard.count({
      where: {
        userId,
        // A card is only considered learned after it has been recalled at least twice.
        repetitions: {
          gte: 2,
        },
      },
    });

    return {
      total,
      dueToday,
      learned,
      toLearn: total - learned,
    };
  }
}
