import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsString,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  flashcardId!: string;

  @IsOptional()
  @IsString()
  lessonId?: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  quality!: number; // 0-2 Again, 3 Hard, 4 Good, 5 Easy
}
