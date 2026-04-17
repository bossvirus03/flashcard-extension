import { Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';
import { LessonService } from './lesson.service';

@Controller('lessons')
@UseGuards(JwtAuthGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  @Get('active')
  async getActiveLesson(@Request() req: ExpressRequest) {
    return this.lessonService.getActiveLesson((req as any).user.id);
  }

  @Post('relearn')
  async startRelearnLesson(@Request() req: ExpressRequest) {
    return this.lessonService.startRelearnLesson((req as any).user.id);
  }
}