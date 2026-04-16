import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, createDeckDto: CreateDeckDto) {
    const deck = await this.prisma.deck.create({
      data: createDeckDto,
    });

    return deck;
  }

  async findAll() {
    return this.prisma.deck.findMany({
      include: {
        flashcards: {
          select: {
            id: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.deck.findUnique({
      where: { id },
      include: {
        flashcards: {
          include: {
            reviews: {
              orderBy: {
                reviewedAt: 'desc',
              },
              take: 1,
            },
          },
        },
      },
    });
  }

  async update(id: string, updateDeckDto: UpdateDeckDto) {
    return this.prisma.deck.update({
      where: { id },
      data: updateDeckDto,
    });
  }

  async remove(id: string) {
    return this.prisma.deck.delete({
      where: { id },
    });
  }
}
