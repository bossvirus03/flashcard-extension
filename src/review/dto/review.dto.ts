import {
  IsNotEmpty,
  IsInt,
  Min,
  Max,
} from 'class-validator';

export class CreateReviewDto {
  @IsNotEmpty()
  flashcardId!: string;

  @IsNotEmpty()
  @IsInt()
  @Min(0)
  @Max(5)
  quality!: number; // 0-2 Again, 3 Hard, 4 Good, 5 Easy
}
