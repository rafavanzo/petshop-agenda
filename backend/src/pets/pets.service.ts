import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarPetDto } from './dto/atualizar-pet.dto';
import { CriarPetDto } from './dto/criar-pet.dto';
import { FiltroPetsDto } from './dto/filtro-pets.dto';
import {
  apagarFoto,
  detectarTipoImagem,
  PASTA_FOTOS_PETS,
  TAMANHO_MAXIMO_FOTO,
} from './fotos';

@Injectable()
export class PetsService {
  constructor(private readonly prisma: PrismaService) {}

  listar({ busca, especie }: FiltroPetsDto) {
    return this.prisma.pet.findMany({
      where: {
        especie, // se vier undefined, o Prisma ignora o filtro
        ...(busca && {
          OR: [
            { nome: { contains: busca, mode: 'insensitive' } },
            { tutorNome: { contains: busca, mode: 'insensitive' } },
            { tutorTelefone: { contains: busca } },
          ],
        }),
      },
      orderBy: { nome: 'asc' },
    });
  }

  async buscar(id: number) {
    const pet = await this.prisma.pet.findUnique({
      where: { id },
      include: { _count: { select: { agendamentos: true } } },
    });
    if (!pet) throw new NotFoundException('Pet não encontrado');
    return pet;
  }

  criar(dto: CriarPetDto) {
    return this.prisma.pet.create({ data: dto });
  }

  async atualizar(id: number, dto: AtualizarPetDto) {
    await this.buscar(id);
    return this.prisma.pet.update({ where: { id }, data: dto });
  }

  async remover(id: number) {
    const pet = await this.buscar(id);
    if (pet._count.agendamentos > 0) {
      throw new ConflictException(
        'Este pet possui agendamentos no histórico e não pode ser excluído',
      );
    }
    await this.prisma.pet.delete({ where: { id } });
    await apagarFoto(pet.foto); // só depois de apagar do banco
  }

  async salvarFoto(id: number, arquivo: Express.Multer.File | undefined) {
    const pet = await this.buscar(id);

    if (!arquivo) {
      throw new BadRequestException('Envie uma imagem no campo "foto"');
    }
    if (arquivo.size > TAMANHO_MAXIMO_FOTO) {
      throw new BadRequestException('A foto deve ter no máximo 2 MB');
    }

    const tipo = detectarTipoImagem(arquivo.buffer);
    if (!tipo) {
      throw new BadRequestException('Formato inválido. Envie uma imagem JPG, PNG ou WEBP');
    }

    // Nome gerado pelo servidor: o nome original do usuário é descartado
    const nomeArquivo = `${randomUUID()}.${tipo}`;
    await writeFile(join(PASTA_FOTOS_PETS, nomeArquivo), arquivo.buffer);

    const atualizado = await this.prisma.pet.update({
      where: { id },
      data: { foto: nomeArquivo },
    });

    await apagarFoto(pet.foto); // apaga a antiga só depois que a nova foi salva
    return atualizado;
  }

  async removerFoto(id: number) {
    const pet = await this.buscar(id);
    const atualizado = await this.prisma.pet.update({
      where: { id },
      data: { foto: null },
    });
    await apagarFoto(pet.foto);
    return atualizado;
  }
}