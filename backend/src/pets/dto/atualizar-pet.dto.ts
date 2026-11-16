import { PartialType } from '@nestjs/mapped-types';
import { CriarPetDto } from './criar-pet.dto';

// Mesmos campos e validações do cadastro, mas todos opcionais
export class AtualizarPetDto extends PartialType(CriarPetDto) {}