import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { isActiveUser } from '../users/domain/user-rules';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schemas/auth.schemas';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private buildTokenResponse(user: {
    id: number;
    name: string;
    email: string;
    role: string;
    companyId?: number | null;
    company?: { nome: string } | null;
  }) {
    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        companyId: user.companyId,
        companyName: user.company?.nome ?? null,
      },
    };
  }

  async register(dto: RegisterInput) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      lastName: dto.lastName || null,
      phone: dto.phone || null,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
      companyId: null,
      status: 'active',
    });

    return this.buildTokenResponse(user);
  }

  async login(dto: LoginInput) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !isActiveUser(user)) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildTokenResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordInput) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      return { message: 'If the email exists, a reset link has been sent.' };
    }

    const resetToken = crypto.randomUUID();
    await this.usersService.update(user.id, { resetToken });
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordInput) {
    const user = await this.usersService.findByResetToken(dto.token);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.update(user.id, { password: hashedPassword, resetToken: null });
    return { message: 'Password reset successfully' };
  }
}
