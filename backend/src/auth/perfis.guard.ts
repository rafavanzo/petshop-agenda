import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Perfil } from '../generated/prisma/client';
import { PERFIS } from './decorators/perfis.decorator';
import type { UsuarioLogado } from './tipos';

@Injectable()
export class PerfisGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const perfisPermitidos = this.reflector.getAllAndOverride<Perfil[]>(PERFIS, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Rota sem @Perfis(): qualquer usuário logado pode acessar
    if (!perfisPermitidos || perfisPermitidos.length === 0) return true;

    const { usuario } = context
      .switchToHttp()
      .getRequest<{ usuario?: UsuarioLogado }>();

    if (!usuario || !perfisPermitidos.includes(usuario.perfil)) {
      throw new ForbiddenException('Você não tem permissão para esta ação');
    }
    return true;
  }
}