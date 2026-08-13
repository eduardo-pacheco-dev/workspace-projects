import { Injectable, UnauthorizedException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { ACTIVE_STATUS, isActiveUser } from '../users/domain/user-rules';
import { BCRYPT_ROUNDS } from '../common/config/security';
import { AuditLogger } from '../common/audit/audit-logger';
import { buildResetToken, parseResetToken } from './reset-token';
import {
  RegisterInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from './schemas/auth.schemas';

export const ACCOUNT_INACTIVE_CODE = 'ACCOUNT_INACTIVE';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000;

interface FailureEntry {
  count: number;
  lockedUntil: number;
  lastAttemptAt: number;
}

@Injectable()
export class AuthService {
  private readonly failedAttempts = new Map<string, FailureEntry>();

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditLogger,
  ) {}

  private buildTokenResponse(user: {
    id: number;
    name: string;
    email: string;
    role: string;
    status?: string;
    tokenVersion?: number;
    companyId?: number | null;
    company?: { nome: string } | null;
  }) {
    const token = this.jwtService.sign({ sub: user.id, tokenVersion: user.tokenVersion ?? 0 });
    return {
      access_token: token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status ?? ACTIVE_STATUS,
        companyId: user.companyId,
        companyName: user.company?.nome ?? null,
      },
    };
  }

  private failureKey(email: string, ip?: string): string {
    return `${email.toLowerCase()}:${ip ?? ''}`;
  }

  private pruneExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of this.failedAttempts) {
      if (entry.lockedUntil !== 0 && entry.lockedUntil < now) {
        this.failedAttempts.delete(key);
      } else if (now - entry.lastAttemptAt > LOCKOUT_MS) {
        this.failedAttempts.delete(key);
      }
    }
  }

  private isAccountLocked(email: string, ip?: string): boolean {
    const entry = this.failedAttempts.get(this.failureKey(email, ip));
    return entry ? entry.lockedUntil > Date.now() : false;
  }

  private registerFailure(email: string, ip?: string): void {
    this.pruneExpiredEntries();
    const key = this.failureKey(email, ip);
    const now = Date.now();
    const entry = this.failedAttempts.get(key) ?? { count: 0, lockedUntil: 0, lastAttemptAt: 0 };
    entry.count += 1;
    entry.lastAttemptAt = now;
    if (entry.count >= MAX_FAILED_ATTEMPTS) {
      entry.lockedUntil = now + LOCKOUT_MS;
      entry.count = 0;
      this.audit.accountLocked(email, ip);
    }
    this.failedAttempts.set(key, entry);
  }

  private clearFailures(email: string, ip?: string): void {
    this.failedAttempts.delete(this.failureKey(email, ip));
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
        status: 'inactive',
      });
      this.audit.register(dto.email);
    }
    return { message: 'Conta criada com sucesso. Aguarde a ativação pelo administrador para acessar o sistema.' };
  }

  async login(dto: LoginInput, ip?: string) {
    if (this.isAccountLocked(dto.email, ip)) {
      this.audit.loginFailure(dto.email, ip, 'account_locked');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      this.registerFailure(dto.email, ip);
      this.audit.loginFailure(dto.email, ip, 'unknown_email');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      this.registerFailure(dto.email, ip);
      this.audit.loginFailure(dto.email, ip, 'bad_password');
      throw new UnauthorizedException('Credenciais inválidas');
    }

    if (!isActiveUser(user)) {
      this.audit.loginFailure(dto.email, ip, 'inactive');
      throw new ForbiddenException({
        statusCode: 403,
        message: 'Conta inativa. Aguarde a ativação pelo administrador.',
        code: ACCOUNT_INACTIVE_CODE,
      });
    }

    this.clearFailures(dto.email, ip);
    this.audit.loginSuccess(dto.email, ip);
    return this.buildTokenResponse(user);
  }

  async forgotPassword(dto: ForgotPasswordInput) {
    const user = await this.usersService.findByEmail(dto.email);
    const { digest } = buildResetToken();
    if (user) {
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
    await this.usersService.update(user.id, {
      password: hashedPassword,
      resetToken: null,
      tokenVersion: (user.tokenVersion ?? 0) + 1,
    });
    this.audit.passwordReset(user.id);
    return { message: 'Password reset successfully' };
  }
}
