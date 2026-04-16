import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Put,
  UseGuards,
  Request,
  Query,
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { FlashcardService } from './flashcard.service';
import {
  CreateFlashcardDto,
  UpdateFlashcardDto,
} from './dto/flashcard.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('flashcards')
@UseGuards(JwtAuthGuard)
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Post()
  async create(
    @Request() req: ExpressRequest,
    @Body() createFlashcardDto: CreateFlashcardDto,
  ) {
    return this.flashcardService.create((req as any).user.id, createFlashcardDto);
  }

  @Get()
  async findAll(@Request() req: ExpressRequest, @Query('deckId') deckId?: string) {
    return this.flashcardService.findAll((req as any).user.id, deckId);
  }

  @Get('due')
  async getDueCards(@Request() req: ExpressRequest, @Query('limit') limit?: number) {
    return this.flashcardService.getDueCards((req as any).user.id, limit ? parseInt(limit as any) : 20);
  }

  @Get('stats')
  async getStats(@Request() req: ExpressRequest) {
    return this.flashcardService.getStats((req as any).user.id);
  }

  @Get(':id')
  async findOne(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.flashcardService.findOne(id, (req as any).user.id);
  }

  @Put(':id')
  async update(
    @Request() req: ExpressRequest,
    @Param('id') id: string,
    @Body() updateFlashcardDto: UpdateFlashcardDto,
  ) {
    return this.flashcardService.update(id, (req as any).user.id, updateFlashcardDto);
  }

  @Delete(':id')
  async remove(@Request() req: ExpressRequest, @Param('id') id: string) {
    return this.flashcardService.remove(id, (req as any).user.id);
  }
}
