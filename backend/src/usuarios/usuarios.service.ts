import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { Prisma } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';

// Campos que a API pode devolver (nunca o senhaHash)
const camposPublicos = {
  id: true,
  nome: true,
  usuario: true,
  perfil: true,
  ativo: true,
  criadoEm: true,
} satisfies Prisma.UsuarioSelect;

@Injectable()
export class UsuariosService {
  constructor(private readonly prisma: PrismaService) {}

  listar() {
    return this.prisma.usuario.findMany({
      select: camposPublicos,
      orderBy: { nome: 'asc' },
    });
  }

  async buscar(id: number) {
    const usuario = await this.prisma.usuario.findUnique({
      where: { id },
      select: camposPublicos,
    });
    if (!usuario) throw new NotFoundException('Usuário não encontrado');
    return usuario;
  }

  async criar(dto: CriarUsuarioDto) {
    const existente = await this.prisma.usuario.findUnique({
      where: { usuario: dto.usuario },
    });
    if (existente) throw new ConflictException('Este nome de usuário já está em uso');

    return this.prisma.usuario.create({
      data: {
        nome: dto.nome,
        usuario: dto.usuario,
        senhaHash: await bcrypt.hash(dto.senha, 10),
        perfil: 'FUNCIONARIO',
      },
      select: camposPublicos,
    });
  }

  async atualizar(id: number, dto: AtualizarUsuarioDto) {
    await this.buscar(id); // 404 se não existir
    return this.prisma.usuario.update({
      where: { id },
      data: { nome: dto.nome },
      select: camposPublicos,
    });
  }

  async redefinirSenha(id: number, senha: string) {
    await this.buscar(id);
    await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id },
        data: { senhaHash: await bcrypt.hash(senha, 10) },
      }),
      this.encerrarSessoes(id),
    ]);
  }

  async desativar(id: number, idGerente: number) {
    if (id === idGerente) {
      throw new BadRequestException('Você não pode desativar o próprio usuário');
    }
    await this.buscar(id);
    const [usuario] = await this.prisma.$transaction([
      this.prisma.usuario.update({
        where: { id },
        data: { ativo: false },
        select: camposPublicos,
      }),
      this.encerrarSessoes(id),
    ]);
    return usuario;
  }

  async ativar(id: number) {
    await this.buscar(id);
    return this.prisma.usuario.update({
      where: { id },
      data: { ativo: true },
      select: camposPublicos,
    });
  }

  // Marca como encerradas todas as sessões abertas do usuário
  private encerrarSessoes(usuarioId: number) {
    return this.prisma.sessao.updateMany({
      where: { usuarioId, encerradaEm: null },
      data: { encerradaEm: new Date() },
    });
  }
}