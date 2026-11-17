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
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
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

  @Post(':id/foto')
  @UseInterceptors(
    // "foto" = nome do campo no formulário; o limite de 5 MB protege a memória
    // (a regra de 2 MB com mensagem amigável fica no service)
    FileInterceptor('foto', { limits: { fileSize: 5 * 1024 * 1024 } }),
  )
  enviarFoto(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() foto: Express.Multer.File | undefined,
  ) {
    return this.petsService.salvarFoto(id, foto);
  }

  @Delete(':id/foto')
  removerFoto(@Param('id', ParseIntPipe) id: number) {
    return this.petsService.removerFoto(id);
  }

  @Perfis('GERENTE') // só esta rota é restrita
  @Delete(':id')
  @HttpCode(204)
  async remover(@Param('id', ParseIntPipe) id: number) {
    await this.petsService.remover(id);
  }
}