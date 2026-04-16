import {
  IsNotEmpty,
  IsString,
  IsOptional,
  MinLength,
  MaxLength,
} from 'class-validator';

export class CreateFlashcardDto {
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  front!: string;

  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  back!: string;

  @IsOptional()
  @IsString()
  deckId?: string;
}

export class UpdateFlashcardDto {
  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  front?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  back?: string;

  @IsOptional()
  @IsString()
  deckId?: string;
}

export class FlashcardResponseDto {
  id!: string;
  front!: string;
  back!: string;
  interval!: number;
  easeFactor!: number;
  repetitions!: number;
  nextReviewDate!: Date;
  createdAt!: Date;
  updatedAt!: Date;
  lastReviewedAt!: Date | null;
}
