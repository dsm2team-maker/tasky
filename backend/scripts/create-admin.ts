import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Usage :
//   ADMIN_EMAIL=... ADMIN_PASSWORD=... npx ts-node scripts/create-admin.ts
// Aucun identifiant n'est stocké dans le dépôt. Le script refuse de promouvoir
// un compte existant (sinon quiconque s'inscrit avec l'email admin devient ADMIN).

const prisma = new PrismaClient();

function isStrongPassword(pw: string): boolean {
  return (
    pw.length >= 14 &&
    /[a-z]/.test(pw) &&
    /[A-Z]/.test(pw) &&
    /[0-9]/.test(pw) &&
    /[^A-Za-z0-9]/.test(pw)
  );
}

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error("ADMIN_EMAIL et ADMIN_PASSWORD doivent être définis dans l'environnement");
  }
  if (!isStrongPassword(password)) {
    throw new Error(
      "ADMIN_PASSWORD trop faible : 14 caractères min, avec minuscule, majuscule, chiffre et caractère spécial"
    );
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new Error(
      `Un compte existe déjà pour ${email} (rôle ${existing.role}). ` +
        "Le script ne promeut jamais un compte existant — vérifier manuellement en base."
    );
  }

  const hash = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: {
      email,
      password: hash,
      role: "ADMIN",
      firstName: "Admin",
      lastName: "Tasky",
      phone: "0000000000",
      emailVerified: true,
      isActive: true,
    },
  });

  console.log(`✅ Compte admin créé pour ${email}`);
}

main()
  .catch((err) => {
    console.error("❌", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
