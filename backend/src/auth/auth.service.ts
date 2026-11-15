import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './tipos';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { usuario: dto.usuario },
    });

    const senhaCorreta = usuario
      ? await bcrypt.compare(dto.senha, usuario.senhaHash)
      : false;

    // Mesma mensagem para qualquer falha: não revela se o usuário existe
    if (!usuario || !senhaCorreta || !usuario.ativo) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const horas = Number(this.config.get('SESSAO_DURACAO_HORAS') ?? 8);
    const expiraEm = new Date(Date.now() + horas * 60 * 60 * 1000);

    const sessao = await this.prisma.sessao.create({
      data: { usuarioId: usuario.id, expiraEm },
    });

    const payload: JwtPayload = { sub: usuario.id, sid: sessao.id };
    const token = await this.jwt.signAsync(payload, {
      expiresIn: horas * 60 * 60, // em segundos
    });

    return {
      token,
      expiraEm,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        usuario: usuario.usuario,
        perfil: usuario.perfil,
      },
    };
  }

  async logout(sessaoId: string) {
    await this.prisma.sessao.update({
      where: { id: sessaoId },
      data: { encerradaEm: new Date() },
    });
  }
}