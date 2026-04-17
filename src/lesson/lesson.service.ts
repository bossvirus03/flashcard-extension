import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

type StudyFlashcard = {
  id: string;
  front: string;
  back: string;
  repetitions: number;
  easeFactor: number;
  interval: number;
  nextReviewDate: Date;
  lastReviewedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class LessonService {
  constructor(private readonly prisma: PrismaService) {}

  async getActiveLesson(userId: string) {
    const prisma = this.prisma as any;
    const lesson = await prisma.lesson.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (!lesson) {
      return null;
    }

    return this.hydrateLesson(lesson);
  }

  async startRelearnLesson(userId: string) {
    const prisma = this.prisma as any;
    const activeLesson = await prisma.lesson.findFirst({
      where: {
        userId,
        completedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    if (activeLesson) {
      return this.hydrateLesson(activeLesson);
    }

    const flashcards = (await prisma.flashcard.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        front: true,
        back: true,
        repetitions: true,
        easeFactor: true,
        interval: true,
        nextReviewDate: true,
        lastReviewedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    })) as StudyFlashcard[];

    if (!flashcards.length) {
      return null;
    }

    const shuffledFlashcards = this.shuffleFlashcards(flashcards);

    const lesson = await prisma.lesson.create({
      data: {
        userId,
        flashcardIds: shuffledFlashcards.map((flashcard) => flashcard.id),
      },
    });

    return this.hydrateLesson(lesson, shuffledFlashcards);
  }

  private async hydrateLesson(
    lesson: {
      id: string;
      userId: string;
      flashcardIds: string[];
      currentIndex: number;
      completedAt: Date | null;
      lastAccessedAt: Date;
      createdAt: Date;
      updatedAt: Date;
    },
    flashcards?: StudyFlashcard[],
  ) {
    const prisma = this.prisma as any;
    const orderedFlashcards =
      flashcards ??
      ((await prisma.flashcard.findMany({
        where: {
          userId: lesson.userId,
          id: {
            in: lesson.flashcardIds,
          },
        },
        select: {
          id: true,
          front: true,
          back: true,
          repetitions: true,
          easeFactor: true,
          interval: true,
          nextReviewDate: true,
          lastReviewedAt: true,
          createdAt: true,
          updatedAt: true,
        },
      })) as StudyFlashcard[]);

    const orderedByLesson = lesson.flashcardIds
      .map((flashcardId) =>
        orderedFlashcards.find((flashcard) => flashcard.id === flashcardId),
      )
      .filter((flashcard): flashcard is StudyFlashcard => Boolean(flashcard));

    const currentIndex = Math.min(lesson.currentIndex, orderedByLesson.length);

    return {
      lesson: {
        ...lesson,
        currentIndex,
        totalCards: orderedByLesson.length,
        isComplete:
          Boolean(lesson.completedAt) || currentIndex >= orderedByLesson.length,
      },
      flashcards: orderedByLesson,
      currentCard: orderedByLesson[currentIndex] ?? null,
    };
  }

  private shuffleFlashcards(flashcards: StudyFlashcard[]) {
    const items = [...flashcards];
    for (let index = items.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
    }

    return items;
  }
}