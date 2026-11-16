import { SetMetadata } from '@nestjs/common';
import type { Perfil } from '../../generated/prisma/client';

export const PERFIS = 'perfis';
export const Perfis = (...perfis: Perfil[]) => SetMetadata(PERFIS, perfis);