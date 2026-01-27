import { Injectable, UnauthorizedException, BadRequestException, NotFoundException } from '@nestjs/common';import { PrismaService } from '../../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

   async register(email: string, name: string, password: string) {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) throw new UnauthorizedException('Email already exists');

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: { email, name, passwordHash: hashedPassword },
    });

    return { user, token: this.generateToken(user.id) };
  }

   async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const passwordValid = await bcrypt.compare(password, user.passwordHash);
    if (!passwordValid) throw new UnauthorizedException('Invalid credentials');

    return { user, token: this.generateToken(user.id) };
  }

   generateToken(userId: number) {
    return this.jwtService.sign({ sub: userId });
  }

   async validateUser(userId: number) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }
    async updateProfile(userId: number, data: { name?: string; avatarUrl?: string }) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data,
    });
    return updated;
  }
    async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) return; 

    const token = randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 1000 * 60 * 60); 

    await this.prisma.passwordResetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt: expires,
      },
    });

    // TODO: send email with link containing token
    console.log(`Password reset link: https://yourfrontend.com/reset-password?token=${token}`);
  }
   async resetPassword(token: string, newPassword: string) {
    const record = await this.prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) throw new BadRequestException('Invalid or expired token');

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash: hashedPassword },
    });

    await this.prisma.passwordResetToken.delete({ where: { token } });

    return { message: 'Password reset successfully' };
  }

  
}
  