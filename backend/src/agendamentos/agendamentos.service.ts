import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '../generated/prisma/client';
import type { StatusAgendamento } from '../generated/prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { HORARIOS, LIMITE_POR_HORARIO } from './agenda.constantes';
import {
  agoraEmSaoPaulo,
  formatar,
  horarioJaPassou,
  paraData,
  paraISO,
} from './agenda.util';
import { AtualizarAgendamentoDto } from './dto/atualizar-agendamento.dto';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';

// Dados relacionados que vêm junto com cada agendamento
const incluirRelacoes = {
  pet: {
    select: {
      id: true,
      nome: true,
      especie: true,
      raca: true,
      porte: true,
      observacoes: true,
      foto: true,
      tutorNome: true,
      tutorTelefone: true,
    },
  },
  criadoPor: { select: { id: true, nome: true } },
} satisfies Prisma.AgendamentoInclude;

// Para qual status cada status pode ir
const TRANSICOES: Record<StatusAgendamento, StatusAgendamento[]> = {
  AGENDADO: ['EM_ANDAMENTO', 'CANCELADO'],
  EM_ANDAMENTO: ['CONCLUIDO'],
  CONCLUIDO: [],
  CANCELADO: [],
};

@Injectable()
export class AgendamentosService {
  constructor(private readonly prisma: PrismaService) {}

  // ---------- Consultas ----------

  async agendaDoDia(dataISO: string) {
    const agendamentos = await this.prisma.agendamento.findMany({
      where: { data: paraData(dataISO), status: { not: 'CANCELADO' } },
      include: incluirRelacoes,
      orderBy: { criadoEm: 'asc' },
    });

    const agora = agoraEmSaoPaulo();

    return {
      data: dataISO,
      horarios: HORARIOS.map((hora) => {
        const doHorario = agendamentos.filter((a) => a.hora === hora);
        return {
          hora,
          passado: horarioJaPassou(dataISO, hora, agora),
          vagas: Math.max(LIMITE_POR_HORARIO - doHorario.length, 0),
          agendamentos: doHorario.map(formatar),
        };
      }),
    };
  }

  async resumoDoMes(ano: number, mes: number) {
    const grupos = await this.prisma.agendamento.groupBy({
      by: ['data'],
      where: {
        data: {
          gte: new Date(Date.UTC(ano, mes - 1, 1)), // dia 1 do mês
          lt: new Date(Date.UTC(ano, mes, 1)), // dia 1 do mês seguinte
        },
        status: { not: 'CANCELADO' },
      },
      _count: { _all: true },
      orderBy: { data: 'asc' },
    });

    return grupos.map((g) => ({ data: paraISO(g.data), total: g._count._all }));
  }

  async historicoDoPet(petId: number) {
    const pet = await this.prisma.pet.findUnique({ where: { id: petId } });
    if (!pet) throw new NotFoundException('Pet não encontrado');

    const agendamentos = await this.prisma.agendamento.findMany({
      where: { petId },
      include: incluirRelacoes,
      orderBy: [{ data: 'desc' }, { hora: 'desc' }],
    });
    return agendamentos.map(formatar);
  }

  async buscar(id: number) {
    const agendamento = await this.prisma.agendamento.findUnique({
      where: { id },
      include: incluirRelacoes,
    });
    if (!agendamento) throw new NotFoundException('Agendamento não encontrado');
    return formatar(agendamento);
  }

  // ---------- Alterações ----------

  async criar(dto: CriarAgendamentoDto, usuarioId: number) {
    const pet = await this.prisma.pet.findUnique({ where: { id: dto.petId } });
    if (!pet) throw new NotFoundException('Pet não encontrado');

    await this.validarHorario(dto.data, dto.hora, dto.petId);

    const agendamento = await this.prisma.agendamento.create({
      data: {
        petId: dto.petId,
        data: paraData(dto.data),
        hora: dto.hora,
        servico: dto.servico,
        observacoes: dto.observacoes,
        criadoPorId: usuarioId,
      },
      include: incluirRelacoes,
    });
    return formatar(agendamento);
  }

  async atualizar(id: number, dto: AtualizarAgendamentoDto) {
    const atual = await this.buscarOuFalhar(id);

    if (atual.status !== 'AGENDADO') {
      throw new BadRequestException(
        'Só é possível editar agendamentos com status AGENDADO',
      );
    }

    const data = dto.data ?? paraISO(atual.data);
    const hora = dto.hora ?? atual.hora;

    // Só revalida o horário se ele mudou
    if (dto.data !== undefined || dto.hora !== undefined) {
      await this.validarHorario(data, hora, atual.petId, id);
    }

    const agendamento = await this.prisma.agendamento.update({
      where: { id },
      data: {
        data: paraData(data),
        hora,
        servico: dto.servico,
        observacoes: dto.observacoes,
      },
      include: incluirRelacoes,
    });
    return formatar(agendamento);
  }

  async alterarStatus(id: number, novoStatus: StatusAgendamento) {
    const atual = await this.buscarOuFalhar(id);

    if (!TRANSICOES[atual.status].includes(novoStatus)) {
      throw new BadRequestException(
        `Não é possível mudar o status de ${atual.status} para ${novoStatus}`,
      );
    }

    const agendamento = await this.prisma.agendamento.update({
      where: { id },
      data: { status: novoStatus },
      include: incluirRelacoes,
    });
    return formatar(agendamento);
  }

  // ---------- Regras ----------

  private async validarHorario(
    dataISO: string,
    hora: number,
    petId: number,
    ignorarId?: number, // na remarcação, ignora o próprio agendamento
  ) {
    if (horarioJaPassou(dataISO, hora)) {
      throw new BadRequestException(
        'Não é possível agendar em um horário que já passou',
      );
    }

    const ocupados = await this.prisma.agendamento.findMany({
      where: {
        data: paraData(dataISO),
        hora,
        status: { not: 'CANCELADO' },
        ...(ignorarId ? { id: { not: ignorarId } } : {}),
      },
      select: { petId: true },
    });

    if (ocupados.some((a) => a.petId === petId)) {
      throw new ConflictException('Este pet já está agendado neste horário');
    }
    if (ocupados.length >= LIMITE_POR_HORARIO) {
      throw new ConflictException('Este horário já está lotado');
    }
  }

  private async buscarOuFalhar(id: number) {
    const agendamento = await this.prisma.agendamento.findUnique({ where: { id } });
    if (!agendamento) throw new NotFoundException('Agendamento não encontrado');
    return agendamento;
  }
}