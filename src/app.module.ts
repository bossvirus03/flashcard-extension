import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { FlashcardModule } from './flashcard/flashcard.module';
import { LessonModule } from './lesson/lesson.module';
import { ReviewModule } from './review/review.module';
import { DeckModule } from './deck/deck.module';
import { PrismaModule } from './prisma/prisma.module';
import { AppController } from './app.controller';

@Module({
  controllers: [AppController],
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    PrismaModule,
    AuthModule,
    FlashcardModule,
    LessonModule,
    ReviewModule,
    DeckModule,
  ],
})
export class AppModule {}
