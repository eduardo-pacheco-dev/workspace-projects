import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { DEFAULT_USER_ALLOWED_PREFIXES } from './role-modules';

const PUBLIC_PREFIXES = ['/auth'];

const OWN_PROFILE_REGEX = /^\/users\/\d+$/;

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') {
  private allowedPrefixesCache: string[] | null = null;
  private cacheTime = 0;
  private readonly CACHE_TTL = 30_000;

  constructor(private readonly settingsService: SettingsService) {
    super();
  }

  private async getAllowedPrefixes(): Promise<string[]> {
    if (
      this.allowedPrefixesCache &&
      Date.now() - this.cacheTime < this.CACHE_TTL
    ) {
      return this.allowedPrefixesCache;
    }
    try {
      const modules = await this.settingsService.getRoleModules('user');
      this.allowedPrefixesCache = modules;
      this.cacheTime = Date.now();
      return modules;
    } catch {
      this.allowedPrefixesCache = [...DEFAULT_USER_ALLOWED_PREFIXES];
      this.cacheTime = Date.now();
      return this.allowedPrefixesCache;
    }
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest();
    const path: string = req?.path ?? '';
    if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return true;
    await this.getAllowedPrefixes();
    return super.canActivate(context) as any;
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ) {
    const result = super.handleRequest(err, user, info, context, status);
    const req = context.switchToHttp().getRequest();
    const path: string = req?.path ?? '';
    if (user && user.role !== 'master') {
      const allowedPrefixes = this.allowedPrefixesCache ?? DEFAULT_USER_ALLOWED_PREFIXES;
      const allowed =
        OWN_PROFILE_REGEX.test(path) ||
        allowedPrefixes.some((p) => path === p || path.startsWith(`${p}/`));
      if (!allowed) {
        throw new ForbiddenException('Acesso negado: perfil sem permissão.');
      }
    }
    return result;
  }
}
