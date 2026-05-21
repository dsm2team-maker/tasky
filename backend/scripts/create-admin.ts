import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const email = "tasky-adm@outlook.fr";
  const password = "Admin@Tasky2026!";
  const hash = await bcrypt.hash(password, 12);

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    await prisma.user.update({
      where: { email },
      data: { role: "ADMIN", emailVerified: true, isActive: true },
    });
    console.log("✅ Compte existant mis à jour en ADMIN");
    return;
  }

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

  console.log("✅ Compte admin créé !");
  console.log("   Email    :", email);
  console.log("   Password :", password);
  console.log("   ⚠️  Changez ce mot de passe après votre première connexion.");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
