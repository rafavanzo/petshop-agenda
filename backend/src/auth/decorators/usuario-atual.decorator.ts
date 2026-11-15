import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { UsuarioLogado } from '../tipos';

export const UsuarioAtual = createParamDecorator(
  (_dados: unknown, ctx: ExecutionContext): UsuarioLogado => {
    const request = ctx.switchToHttp().getRequest();
    return request.usuario;
  },
);