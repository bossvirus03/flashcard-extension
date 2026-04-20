import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsUrl,
} from 'class-validator';

export class GoogleLoginDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsNotEmpty()
  googleId!: string;

  @IsOptional()
  name?: string;

  @IsOptional()
  @IsUrl()
  picture?: string;
}

export class AuthResponseDto {
  id!: string;
  email!: string;
  name!: string | null;
  picture!: string | null;
  access_token!: string;
}


export interface RequestWithUser {
  user: {
    id: string;
    email: string;
    name?: string;
    picture?: string;
  };
}