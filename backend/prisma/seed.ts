import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const categoriesData = JSON.parse(
  fs.readFileSync(
    path.resolve(__dirname, "../../src/data/categories.json"),
    "utf-8",
  ),
) as {
  categories: Array<{
    id: string;
    nom: string;
    icon: string;
    description: string;
    sousCategories: Array<{
      id: string;
      nom: string;
      prestations: Array<{
        id: string;
        nom: string;
      }>;
    }>;
  }>;
};

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Démarrage du seed...\n");

  for (const categorie of categoriesData.categories) {
    // 1. Upsert Category
    await prisma.category.upsert({
      where: { id: categorie.id },
      update: {
        nom: categorie.nom,
        icon: categorie.icon,
        description: categorie.description,
      },
      create: {
        id: categorie.id,
        nom: categorie.nom,
        slug: categorie.id,
        icon: categorie.icon,
        description: categorie.description,
      },
    });
    console.log(`✅ Catégorie : ${categorie.icon} ${categorie.nom}`);

    for (const sousCat of categorie.sousCategories) {
      // 2. Upsert SubCategory
      await prisma.subCategory.upsert({
        where: { id: sousCat.id },
        update: { nom: sousCat.nom },
        create: {
          id: sousCat.id,
          nom: sousCat.nom,
          slug: sousCat.id,
          categoryId: categorie.id,
        },
      });
      console.log(`   ↳ Sous-catégorie : ${sousCat.nom}`);

      for (const prestation of sousCat.prestations) {
        // 3. Upsert Intervention
        await prisma.intervention.upsert({
          where: { id: prestation.id },
          update: { nom: prestation.nom },
          create: {
            id: prestation.id,
            nom: prestation.nom,
            subCategoryId: sousCat.id,
          },
        });
        console.log(`      • ${prestation.nom}`);
      }
    }
  }

  console.log("\n🎉 Seed terminé !");
  console.log(`   Catégories      : ${categoriesData.categories.length}`);
  console.log(
    `   Sous-catégories : ${categoriesData.categories.reduce((acc, c) => acc + c.sousCategories.length, 0)}`,
  );
  console.log(
    `   Interventions   : ${categoriesData.categories.reduce((acc, c) => acc + c.sousCategories.reduce((a, s) => a + s.prestations.length, 0), 0)}`,
  );
}

main()
  .catch((e) => {
    console.error("❌ Erreur seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
