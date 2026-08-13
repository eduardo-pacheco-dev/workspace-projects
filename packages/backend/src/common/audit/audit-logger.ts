import { Injectable, Logger, Optional } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

const DEFAULT_LOG_PATH = 'logs/security.log';

@Injectable()
export class AuditLogger {
  private readonly logger = new Logger('SecurityAudit');
  private readonly logPath: string;

  constructor(@Optional() logPath?: string) {
    this.logPath = logPath ?? DEFAULT_LOG_PATH;
  }

  private write(event: string, details: Record<string, unknown>): void {
    const line = JSON.stringify({ ts: new Date().toISOString(), event, ...details });
    this.logger.log(line);
    try {
      const dir = path.dirname(this.logPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.appendFileSync(this.logPath, `${line}\n`);
    } catch {
      // falha de gravação não deve interromper a autenticação
    }
  }

  loginSuccess(email: string, ip?: string): void {
    this.write('login_success', { email, ip });
  }

  loginFailure(email: string, ip?: string, reason?: string): void {
    this.write('login_failure', { email, ip, reason });
  }

  accountLocked(email: string, ip?: string): void {
    this.write('account_locked', { email, ip });
  }

  passwordReset(userId: number): void {
    this.write('password_reset', { userId });
  }

  register(email: string): void {
    this.write('register', { email });
  }
}
