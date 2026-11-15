import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ROTA_PUBLICA } from './decorators/publico.decorator';
import type { JwtPayload, UsuarioLogado } from './tipos';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly jwt: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. A rota é pública? Libera direto.
    const publica = this.reflector.getAllAndOverride<boolean>(ROTA_PUBLICA, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (publica) return true;

    const request = context
      .switchToHttp()
      .getRequest<Request & { usuario?: UsuarioLogado }>();

    // 2. Tem token no header?
    const token = this.extrairToken(request);
    if (!token) {
      throw new UnauthorizedException('Faça login para continuar');
    }

    // 3. O token é válido (assinatura e validade)?
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(token);
    } catch {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    // 4. A sessão ainda está ativa no banco?
    const sessao = await this.prisma.sessao.findUnique({
      where: { id: payload.sid },
      include: { usuario: true },
    });

    if (
      !sessao ||
      sessao.encerradaEm ||
      sessao.expiraEm < new Date() ||
      !sessao.usuario.ativo
    ) {
      throw new UnauthorizedException('Sessão inválida ou expirada');
    }

    // 5. Tudo certo: anexa o usuário à requisição
    request.usuario = {
      id: sessao.usuario.id,
      nome: sessao.usuario.nome,
      usuario: sessao.usuario.usuario,
      perfil: sessao.usuario.perfil,
      sessaoId: sessao.id,
    };
    return true;
  }

  private extrairToken(request: Request): string | undefined {
    const [tipo, token] = request.headers.authorization?.split(' ') ?? [];
    return tipo === 'Bearer' ? token : undefined;
  }
}