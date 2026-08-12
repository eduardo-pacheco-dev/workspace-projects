import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { isActiveUser } from '../users/domain/user-rules';
import { BCRYPT_ROUNDS } from '../common/config/security';
import { buildResetToken, parseResetToken } from './reset-token';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schemas/auth.schemas';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface FailureEntry {
  count: number;
  lockedUntil: number;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly failedAttempts = new Map<string, FailureEntry>();

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
    const token = this.jwtService.sign({ sub: user.id });
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

  private isAccountLocked(email: string): boolean {
    const key = email.toLowerCase();
    const entry = this.failedAttempts.get(key);
    if (!entry) return false;
    if (entry.lockedUntil > Date.now()) return true;
    if (entry.lockedUntil !== 0) {
      this.failedAttempts.delete(key);
    }
    return false;
  }

  private registerFailure(email: string): void {
    const key = email.toLowerCase();
    const entry = this.failedAttempts.get(key) ?? { count: 0, lockedUntil: 0 };
    entry.count += 1;
    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      entry.lockedUntil = Date.now() + LOCKOUT_MS;
      entry.count = 0;
      this.logger.warn(`Account temporarily locked after repeated failed logins: ${key}`);
    }
    this.failedAttempts.set(key, entry);
  }

  private clearFailures(email: string): void {
    this.failedAttempts.delete(email.toLowerCase());
  }

  async register(dto: RegisterInput) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (!existing) {
      const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
      await this.usersService.create({
        name: dto.name,
        lastName: dto.lastName || null,
        phone: dto.phone || null,
        email: dto.email,
        password: hashedPassword,
        role: 'user',
        companyId: null,
        status: 'active',
      });
    }
    return { message: 'Registration successful. Please sign in.' };
  }

  async login(dto: LoginInput) {
    if (this.isAccountLocked(dto.email)) {
      this.logger.warn(`Login attempt on a locked account: ${dto.email.toLowerCase()}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user || !isActiveUser(user)) {
      this.registerFailure(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.registerFailure(dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.clearFailures(dto.email);
    this.logger.log(`Successful login: ${dto.email.toLowerCase()}`);
    return this.buildTokenResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordInput) {
    const user = await this.usersService.findByEmail(dto.email);
    if (user) {
      const { digest } = buildResetToken();
      await this.usersService.update(user.id, { resetToken: digest });
    }
    return { message: 'If the email exists, a reset link has been sent.' };
  }

  async resetPassword(dto: ResetPasswordInput) {
    const parsed = parseResetToken(dto.token);
    if (!parsed || parsed.expiresAt < Date.now()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const user = await this.usersService.findByResetToken(parsed.digest);
    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_ROUNDS);
    await this.usersService.update(user.id, { password: hashedPassword, resetToken: null });
    return { message: 'Password reset successfully' };
  }
}
