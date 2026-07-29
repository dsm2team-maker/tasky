import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import { encrypt } from "../src/lib/crypto";

dotenv.config();

const prisma = new PrismaClient();

// Migration ponctuelle : chiffre les IBAN/BIC/bankName déjà en clair en base.
// Idempotent — ignore les valeurs déjà chiffrées (préfixe "v1:").
// À exécuter une seule fois après déploiement de ENCRYPTION_KEY : ts-node scripts/encrypt-bank-data.ts

async function main() {
  const prestataires = await prisma.prestataire.findMany({
    where: {
      OR: [{ iban: { not: null } }, { bic: { not: null } }, { bankName: { not: null } }],
    },
    select: { id: true, iban: true, bic: true, bankName: true },
  });

  let updated = 0;

  for (const p of prestataires) {
    const data: Record<string, string> = {};

    if (p.iban && !p.iban.startsWith("v1:")) data.iban = encrypt(p.iban);
    if (p.bic && !p.bic.startsWith("v1:")) data.bic = encrypt(p.bic);
    if (p.bankName && !p.bankName.startsWith("v1:")) data.bankName = encrypt(p.bankName);

    if (Object.keys(data).length === 0) continue;

    await prisma.prestataire.update({ where: { id: p.id }, data });
    updated++;
  }

  console.log(`✅ ${updated}/${prestataires.length} prestataire(s) chiffré(s).`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
