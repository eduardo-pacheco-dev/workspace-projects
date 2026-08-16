import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { SettingsService } from '../../settings/settings.service';
import { DEFAULT_ROLE_MODULES } from './role-modules';

const PUBLIC_ROUTES = [
  '/auth/login',
  '/auth/register',
  '/auth/forgot-password',
  '/auth/reset-password',
];

const OWN_PROFILE_REGEX = /^\/users\/\d+$/;
const OWN_COMPANY_REGEX = /^\/companies\/me$/;
const OWN_MODULES_REGEX = /^\/settings\/my-modules$/;
const OWN_DASHBOARD_NOTE_REGEX = /^\/dashboard-notes\/me$/;

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') {
  private moduleCache: Record<string, { modules: string[]; time: number }> = {};
  private readonly CACHE_TTL = 30_000;

  constructor(private readonly settingsService: SettingsService) {
    super();
  }

  private async getRoleModules(role: string): Promise<string[]> {
    const cached = this.moduleCache[role];
    if (cached && Date.now() - cached.time < this.CACHE_TTL) {
      return cached.modules;
    }
    try {
      const modules = await this.settingsService.getRoleModules(role);
      this.moduleCache[role] = { modules, time: Date.now() };
      return modules;
    } catch {
      const fallback = [...(DEFAULT_ROLE_MODULES[role] ?? [])];
      this.moduleCache[role] = { modules: fallback, time: Date.now() };
      return fallback;
    }
  }

  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const path: string = req?.path ?? '';
    if (PUBLIC_ROUTES.includes(path)) return true;
    return super.canActivate(context);
  }

  handleRequest(
    err: any,
    user: any,
    info: any,
    context: ExecutionContext,
    status?: any,
  ): any {
    return (async () => {
      const result = await super.handleRequest(err, user, info, context, status);
      const req = context.switchToHttp().getRequest();
      const path: string = req?.path ?? '';
      if (result && result.role && result.role !== 'master') {
        const modules = await this.getRoleModules(result.role);
        const allowed =
          OWN_PROFILE_REGEX.test(path) ||
          OWN_COMPANY_REGEX.test(path) ||
          OWN_MODULES_REGEX.test(path) ||
          OWN_DASHBOARD_NOTE_REGEX.test(path) ||
          modules.some((p) => path === p || path.startsWith(`${p}/`));
        if (!allowed) {
          throw new ForbiddenException('Acesso negado: perfil sem permissão.');
        }
      }
      return result;
    })();
  }
}
