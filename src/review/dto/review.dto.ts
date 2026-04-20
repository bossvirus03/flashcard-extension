import { IsBoolean, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateReviewDto {
  @IsString()
  @IsNotEmpty({ message: "flashcardId must not be empty" })
  flashcardId!: string; // ← Thêm dấu ! ở đây

  @IsBoolean()
  isGotIt!: boolean; // ← Thêm dấu !

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  lessonId?: string;
}
