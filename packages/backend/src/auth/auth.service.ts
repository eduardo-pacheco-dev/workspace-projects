import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { UsersService } from '../users/users.service';
import { ACTIVE_STATUS } from '../users/domain/user-rules';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schemas/auth.schemas';

export const ACCOUNT_INACTIVE_CODE = 'ACCOUNT_INACTIVE';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterInput) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new BadRequestException('Email já cadastrado');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    await this.usersService.create({
      name: dto.name,
      lastName: dto.lastName || null,
      phone: dto.phone || null,
      email: dto.email,
      password: hashedPassword,
      role: 'user',
      companyId: null,
    });

    return {
      message: 'Conta criada com sucesso. Aguarde a ativação pelo administrador para acessar o sistema.',
    };
  }

  async login(dto: LoginInput) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (user.status !== ACTIVE_STATUS) {
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Conta inativa. Aguarde a ativação pelo administrador.',
        code: ACCOUNT_INACTIVE_CODE,
      });
    }

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
        status: user.status,
      },
    };
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
