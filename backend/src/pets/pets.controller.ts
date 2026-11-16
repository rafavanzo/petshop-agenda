import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { Perfis } from '../auth/decorators/perfis.decorator';
import { AtualizarPetDto } from './dto/atualizar-pet.dto';
import { CriarPetDto } from './dto/criar-pet.dto';
import { FiltroPetsDto } from './dto/filtro-pets.dto';
import { PetsService } from './pets.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly petsService: PetsService) {}

  @Get()
  listar(@Query() filtro: FiltroPetsDto) {
    return this.petsService.listar(filtro);
  }

  @Get(':id')
  buscar(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.buscar(id);
  }

  @Post()
  criar(@Body() dto: CriarPetDto) {
    return this.petsService.criar(dto);
  }

  @Patch(':id')
  atualizar(@Param('id', ParseIntPipe) id: number, @Body() dto: AtualizarPetDto) {
    return this.petsService.atualizar(id, dto);
  }

  @Perfis('GERENTE') // só esta rota é restrita
  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.petsService.remover(id);
  }
}