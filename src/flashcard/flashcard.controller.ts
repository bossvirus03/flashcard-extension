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
  Patch,
  DefaultValuePipe,
  ParseIntPipe,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { FlashcardService } from "./flashcard.service";
import { CreateFlashcardDto, UpdateFlashcardDto } from "./dto/flashcard.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RequestWithUser } from "@/auth/dto/auth.dto";

@Controller("flashcards")
@UseGuards(JwtAuthGuard)
export class FlashcardController {
  constructor(private readonly flashcardService: FlashcardService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createFlashcardDto: CreateFlashcardDto,
  ) {
    return this.flashcardService.create(req.user.id, createFlashcardDto);
  }

  @Get('all')
  findAll(
    @Request() req: RequestWithUser,
    @Query('deckId') deckId?: string,
  ) {
    return this.flashcardService.findAll(req.user.id, deckId);
  }

  @Get('due')
  getDueCards(
    @Request() req: RequestWithUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.flashcardService.getDueCards(req.user.id, limit);
  }

  @Get('practice')
  getPracticeCards(
    @Request() req: RequestWithUser,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ) {
    return this.flashcardService.getPracticeCards(req.user.id, limit);
  }

  @Get('stats')
  getStats(@Request() req: RequestWithUser) {
    return this.flashcardService.getStats(req.user.id);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.flashcardService.findOne(id, req.user.id);
  }

  @Patch(':id')
  update(
    @Request() req: RequestWithUser,
    @Param('id') id: string,
    @Body() updateFlashcardDto: UpdateFlashcardDto,
  ) {
    return this.flashcardService.update(id, req.user.id, updateFlashcardDto);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.flashcardService.remove(id, req.user.id);
  }
}
