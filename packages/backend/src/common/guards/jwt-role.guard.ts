import {
  Injectable,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';

const PUBLIC_PREFIXES = ['/auth'];

const USER_ALLOWED_PREFIXES = [
  '/tasks',
  '/service-orders',
  '/collaborators',
  '/stations',
  '/radio-links',
  '/projects',
  '/clients',
  '/attachments',
  '/comments',
  '/lpus',
  '/teams',
];

const OWN_PROFILE_REGEX = /^\/users\/\d+$/;

@Injectable()
export class JwtRoleGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
    const req = context.switchToHttp().getRequest();
    const path: string = req?.path ?? '';
    if (PUBLIC_PREFIXES.some((p) => path.startsWith(p))) return true;
    return super.canActivate(context);
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
      const allowed =
        OWN_PROFILE_REGEX.test(path) ||
        USER_ALLOWED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));
      if (!allowed) {
        throw new ForbiddenException('Acesso negado: perfil sem permissão.');
      }
    }
    return result;
  }
}
