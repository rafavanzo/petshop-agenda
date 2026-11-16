import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { UsuarioAtual } from '../auth/decorators/usuario-atual.decorator';
import type { UsuarioLogado } from '../auth/tipos';
import { AtualizarUsuarioDto } from './dto/atualizar-usuario.dto';
import { CriarUsuarioDto } from './dto/criar-usuario.dto';
import { RedefinirSenhaDto } from './dto/redefinir-senha.dto';
import { UsuariosService } from './usuarios.service';

@Perfis('GERENTE') // vale para todas as rotas deste controller
@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Get()
  listar() {
    return this.usuariosService.listar();
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.buscar(id);
  }

  @Post()
  criar(@Body() dto: CriarUsuarioDto) {
    return this.usuariosService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarUsuarioDto) {
    return this.usuariosService.atualizar(id, dto);
  }

  @Patch(':id/senha')
  @HttpCode(204)
  async redefinirSenha(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: RedefinirSenhaDto,
  ) {
    await this.usuariosService.redefinirSenha(id, dto.senha);
  }

  @Patch(':id/desativar')
  desativar(
    @Param('id', ParseIntPipe) id: number,
    @UsuarioAtual() gerente: UsuarioLogado,
  ) {
    return this.usuariosService.desativar(id, gerente.id);
  }

  @Patch(':id/ativar')
  ativar(@Param('id', ParseIntPipe) id: number) {
    return this.usuariosService.ativar(id);
  }
}