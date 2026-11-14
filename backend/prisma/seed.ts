import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcryptjs';
import { PrismaClient } from '../src/generated/prisma/client';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const usuario = process.env.SEED_ADMIN_USUARIO;
  const senha = process.env.SEED_ADMIN_SENHA;

  if (!usuario || !senha) {
    throw new Error('Defina SEED_ADMIN_USUARIO e SEED_ADMIN_SENHA no .env');
  }

  // ---------- Gerente padrão ----------
  const senhaHash = await bcrypt.hash(senha, 10);

  const admin = await prisma.usuario.upsert({
    where: { usuario },
    update: {}, // se já existe, não mexe (não reseta a senha)
    create: {
      nome: 'Administrador',
      usuario,
      senhaHash,
      perfil: 'GERENTE',
    },
  });
  console.log(`Gerente pronto: ${admin.usuario}`);

  // ---------- Pets de exemplo ----------
  const totalPets = await prisma.pet.count();

  if (totalPets === 0) {
    await prisma.pet.createMany({
      data: [
        {
          nome: 'Tekila',
          especie: 'CACHORRO',
          raca: 'Golden Retriever',
          porte: 'GRANDE',
          tutorNome: 'Rafael Vanzo',
          tutorTelefone: '(19) 99876-5432',
          tutorEndereco: 'Rua Carioba, 1540 - Vila Cordenonsi, Americana/SP',
        },
        {
          nome: 'Meg',
          especie: 'CACHORRO',
          raca: 'Spitza',
          porte: 'PEQUENO',
          observacoes: 'tem muita energia',
          tutorNome: 'Raquel Campos',
          tutorTelefone: '(19) 99123-4567',
          tutorEndereco: 'Av. Brasil, 850 - Jardim Ipiranga, Americana/SP',
        },
        {
          nome: 'Cacau',
          especie: 'CACHORRO',
          raca: 'Border Collie',
          porte: 'MEDIO',
          tutorNome: 'Rosana Delatim',
          tutorTelefone: '(19) 98765-1234',
          tutorEndereco: 'Rua São Paulo, 45 - Vila Santa Catarina, Americana/SP',
        },
      ],
    });
    console.log('3 pets de exemplo criados');
  } else {
    console.log(`Pets já existem (${totalPets}), nada criado`);
  }
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
