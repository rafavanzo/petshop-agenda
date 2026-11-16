import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AtualizarPetDto } from './dto/atualizar-pet.dto';
import { CriarPetDto } from './dto/criar-pet.dto';
import { FiltroPetsDto } from './dto/filtro-pets.dto';

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
  }
}