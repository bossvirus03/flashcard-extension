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
  Patch,
} from "@nestjs/common";
import { Request as ExpressRequest } from "express";
import { DeckService } from "./deck.service";
import { CreateDeckDto, UpdateDeckDto } from "./dto/deck.dto";
import { JwtAuthGuard } from "@/auth/guards/jwt-auth.guard";
import { RequestWithUser } from "@/auth/dto/auth.dto";

@Controller("decks")
@UseGuards(JwtAuthGuard)
export class DeckController {
  constructor(private readonly deckService: DeckService) {}

  @Post()
  create(
    @Request() req: RequestWithUser,
    @Body() createDeckDto: CreateDeckDto,
  ) {
    return this.deckService.create(
      req.user.id,
      createDeckDto.name,
      createDeckDto.description,
    );
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.deckService.findAll(req.user.id);
  }

  @Get(":id")
  findOne(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.deckService.findOne(id, req.user.id);
  }

  @Patch(":id")
  update(
    @Request() req: RequestWithUser,
    @Param("id") id: string,
    @Body() updateDeckDto: UpdateDeckDto,
  ) {
    if (!updateDeckDto.name) {
      throw new Error("Deck name is required");
    }
    return this.deckService.update(
      id,
      req.user.id,
      updateDeckDto.name,
      updateDeckDto.description,
    );
  }

  @Delete(":id")
  remove(@Request() req: RequestWithUser, @Param("id") id: string) {
    return this.deckService.remove(id, req.user.id);
  }
}
