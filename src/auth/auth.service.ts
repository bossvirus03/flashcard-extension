import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '@/prisma/prisma.service';
import { GoogleLoginDto, AuthResponseDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async googleLogin(googleLoginDto: GoogleLoginDto): Promise<AuthResponseDto> {
    const { email, googleId, name, picture } = googleLoginDto;

    // Find or create user
    let user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email,
          googleId,
          name,
          picture,
        },
      });
    } else if (user.googleId !== googleId) {
      // Update googleId if different
      user = await this.prisma.user.update({
        where: { id: user.id },
        data: { googleId },
      });
    }

    const access_token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      picture: user.picture,
      access_token,
    };
  }

  async validateUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    return user;
  }
}
