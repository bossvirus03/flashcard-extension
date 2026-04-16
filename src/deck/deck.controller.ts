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
} from '@nestjs/common';
import { Request as ExpressRequest } from 'express';
import { DeckService } from './deck.service';
import { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';
import { JwtAuthGuard } from '@/auth/guards/jwt-auth.guard';

@Controller('decks')
@UseGuards(JwtAuthGuard)
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  async create(@Request() req: ExpressRequest, @Body() createDeckDto: CreateDeckDto) {
    return this.deckService.create((req as any).user.id, createDeckDto);
  }

  @Get()
  async findAll() {
    return this.deckService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.deckService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    return this.deckService.update(id, updateDeckDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.deckService.remove(id);
  }
}
