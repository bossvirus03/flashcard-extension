import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReviewDto {
  @IsString()
  @IsUUID()
  flashcardId!: string;

  @IsBoolean()
  isGotIt!: boolean;

  @IsOptional()
  @IsString()
  @IsUUID()
  lessonId?: string;
}