import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const categories = [
  {
    id: "textile-creation",
    nom: "Textile & Création Textile",
    icon: "🧵",
    slug: "textile-creation",
    description: "Retouches, créations et personnalisations textiles",
  },
  {
    id: "personnalisation-objets",
    nom: "Personnalisation & Objets Créatifs",
    icon: "🎨",
    slug: "personnalisation-objets",
    description: "Objets personnalisés et artisanat créatif",
  },
  {
    id: "reparation-remise-etat",
    nom: "Réparation & Remise en État Légère",
    icon: "🔧",
    slug: "reparation-remise-etat",
    description: "Réparations simples et remise en état d'objets",
  },
  {
    id: "fabrication-numerique",
    nom: "Fabrication Numérique & Sur Mesure",
    icon: "🖨",
    slug: "fabrication-numerique",
    description: "Impression 3D et fabrication personnalisée",
  },
  {
    id: "bois-creation",
    nom: "Bois & Création Artisanale",
    icon: "🪵",
    slug: "bois-creation",
    description: "Menuiserie décorative et objets en bois",
  },
  {
    id: "cordonnerie",
    nom: "Cordonnerie & Entretien Chaussures",
    icon: "👞",
    slug: "cordonnerie",
    description: "Réparation et entretien de chaussures",
  },
  {
    id: "creation-cuir",
    nom: "Création & Accessoires en Cuir",
    icon: "🧵",
    slug: "creation-cuir",
    description: "Bracelets, accessoires et réparations en cuir",
  },
];

async function main() {
  console.log("🌱 Démarrage du seed...\n");

  for (const category of categories) {
    await prisma.category.upsert({
      where: { id: category.id },
      update: {},
      create: category,
    });
    console.log(`✅ Catégorie créée : ${category.icon} ${category.nom}`);
  }

  console.log(
    "\n🎉 Seed terminé ! Les catégories sont dans la base de données.",
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
