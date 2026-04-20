import { IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateFlashcardDto {
  @IsString()
  front!: string;

  @IsString()
  back!: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  deckId?: string;
}

export class UpdateFlashcardDto {
  @IsOptional()
  @IsString()
  front?: string;

  @IsOptional()
  @IsString()
  back?: string;

  @IsOptional()
  @IsString()
  @IsUUID()
  deckId?: string;
}