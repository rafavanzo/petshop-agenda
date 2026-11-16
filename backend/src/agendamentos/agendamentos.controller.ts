import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';
import type { UsuarioLogado } from '../auth/tipos';
import { AgendamentosService } from './agendamentos.service';
import { AgendaDiaDto } from './dto/agenda-dia.dto';
import { AlterarStatusDto } from './dto/alterar-status.dto';
import { AtualizarAgendamentoDto } from './dto/atualizar-agendamento.dto';
import { CriarAgendamentoDto } from './dto/criar-agendamento.dto';
import { ResumoMesDto } from './dto/resumo-mes.dto';

@Controller('agendamentos')
export class AgendamentosController {
  constructor(private readonly agendamentosService: AgendamentosService) {}

  // Rotas fixas ANTES de ':id'
  @Get('agenda')
  agendaDoDia(@Query() { data }: AgendaDiaDto) {
    return this.agendamentosService.agendaDoDia(data);
  }

  @Get('mes')
  resumoDoMes(@Query() { ano, mes }: ResumoMesDto) {
    return this.agendamentosService.resumoDoMes(ano, mes);
  }

  @Get('pet/:petId')
  historicoDoPet(@Param('petId', ParseIntPipe) petId: number) {
    return this.agendamentosService.historicoDoPet(petId);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.agendamentosService.buscar(id);
  }

  @Post()
  criar(@Body() dto: CriarAgendamentoDto, @UsuarioAtual() usuario: UsuarioLogado) {
    return this.agendamentosService.criar(dto, usuario.id);
  }

  @Patch(':id')
  atualizar(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AtualizarAgendamentoDto,
  ) {
    return this.agendamentosService.atualizar(id, dto);
  }

  @Patch(':id/status')
  alterarStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() { status }: AlterarStatusDto,
  ) {
    return this.agendamentosService.alterarStatus(id, status);
  }
}