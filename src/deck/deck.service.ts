import { Injectable } from "@nestjs/common";
import { PrismaService } from "@/prisma/prisma.service";

@Injectable()
export class DeckService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, name: string, description?: string) {
    return this.prisma.deck.create({
      data: { userId, name, description },
    });
  }

  async findAll(userId: string) {
    return this.prisma.deck.findMany({
      where: { userId },
      include: { _count: { select: { flashcards: true } } },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, userId: string) {
    return this.prisma.deck.findUnique({
      where: { id, userId },
      include: { flashcards: true },
    });
  }

  async update(id: string, userId: string, name: string, description?: string) {
    return this.prisma.deck.update({
      where: { id, userId },
      data: { name, description },
    });
  }

  async remove(id: string, userId: string) {
    return this.prisma.deck.delete({ where: { id, userId } });
  }
}
