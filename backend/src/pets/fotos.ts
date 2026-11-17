import { mkdirSync } from 'node:fs';
import { rm } from 'node:fs/promises';
import { join } from 'node:path';

export const PASTA_UPLOADS = join(process.cwd(), 'uploads');
export const PASTA_FOTOS_PETS = join(PASTA_UPLOADS, 'pets');
export const TAMANHO_MAXIMO_FOTO = 2 * 1024 * 1024; // 2 MB

// Garante que a pasta existe quando a aplicação sobe
mkdirSync(PASTA_FOTOS_PETS, { recursive: true });

// Descobre o tipo REAL da imagem pelos primeiros bytes do arquivo.
// A extensão e o "mimetype" vêm do usuário e podem mentir; a assinatura não.
export function detectarTipoImagem(buffer: Buffer): 'jpg' | 'png' | 'webp' | null {
  if (buffer.length < 12) return null;

  // JPEG começa com FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return 'jpg';

  // PNG começa com 89 "PNG"
  if (buffer[0] === 0x89 && buffer.toString('ascii', 1, 4) === 'PNG') return 'png';

  // WEBP: "RIFF" .... "WEBP"
  if (buffer.toString('ascii', 0, 4) === 'RIFF' && buffer.toString('ascii', 8, 12) === 'WEBP') {
    return 'webp';
  }

  return null;
}

export async function apagarFoto(nomeArquivo: string | null) {
  if (!nomeArquivo) return;
  await rm(join(PASTA_FOTOS_PETS, nomeArquivo), { force: true }); // force: não reclama se já não existir
}
