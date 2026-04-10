import { prisma } from "../../lib/prisma";

export interface CreateDemandeData {
  titre: string;
  description: string;
  typePrestation: "MODIFICATION" | "CREATION" | "FORMATION";
  categoryId: string;
  subCategoryId?: string;
  interventionIds?: string[];
  budget?: number;
  ville?: string;
  photos?: string[];
  dateEcheance?: string;
  urgence?: "NORMAL" | "URGENT" | "TRES_URGENT";
}

// =============================================================================
// CREATE DEMANDE
// =============================================================================
export const createDemande = async (
  userId: string,
  data: CreateDemandeData,
) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const category = await prisma.category.findUnique({
    where: { id: data.categoryId },
  });
  if (!category) throw new Error("CATEGORY_NOT_FOUND");

  if (data.subCategoryId) {
    const subCategory = await prisma.subCategory.findUnique({
      where: { id: data.subCategoryId },
    });
    if (!subCategory) throw new Error("SUBCATEGORY_NOT_FOUND");
  }

  const demande = await prisma.demande.create({
    data: {
      clientId: client.id,
      titre: data.titre,
      description: data.description,
      typePrestation: data.typePrestation,
      categoryId: data.categoryId,
      subCategoryId: data.subCategoryId || null,
      interventionIds: data.interventionIds || [],
      budget: data.budget || null,
      ville: data.ville || null,
      photos: data.photos || [],
      dateEcheance: data.dateEcheance ? new Date(data.dateEcheance) : null,
      urgence: data.urgence || "NORMAL",
      status: "PUBLIEE",
    },
    include: {
      category: { select: { id: true, nom: true, icon: true } },
      subCategory: { select: { id: true, nom: true } },
    },
  });

  return demande;
};

// =============================================================================
// GET MY DEMANDES
// =============================================================================
export const getMyDemandes = async (userId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  return await prisma.demande.findMany({
    where: { clientId: client.id, status: { not: "SUPPRIMEE" } },
    include: {
      category: { select: { id: true, nom: true, icon: true } },
      subCategory: { select: { id: true, nom: true } },
      _count: { select: { devis: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

// =============================================================================
// GET DEMANDE
// =============================================================================
export const getDemande = async (userId: string, demandeId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const demande = await prisma.demande.findUnique({
    where: { id: demandeId },
    include: {
      category: { select: { id: true, nom: true, icon: true } },
      subCategory: { select: { id: true, nom: true } },
      devis: {
        include: {
          prestataire: {
            select: {
              id: true,
              bio: true,
              rating: true,
              reviewCount: true,
              user: {
                select: { firstName: true, lastName: true, avatar: true },
              },
            },
          },
        },
      },
      _count: { select: { devis: true } },
    },
  });

  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.clientId !== client.id) throw new Error("FORBIDDEN");

  return demande;
};

// =============================================================================
// DELETE DEMANDE
// =============================================================================
export const deleteDemande = async (userId: string, demandeId: string) => {
  const client = await prisma.client.findUnique({ where: { userId } });
  if (!client) throw new Error("CLIENT_NOT_FOUND");

  const demande = await prisma.demande.findUnique({ where: { id: demandeId } });
  if (!demande) throw new Error("DEMANDE_NOT_FOUND");
  if (demande.clientId !== client.id) throw new Error("FORBIDDEN");
  if (demande.status === "EN_COURS") throw new Error("DEMANDE_EN_COURS");

  await prisma.demande.update({
    where: { id: demandeId },
    data: { status: "SUPPRIMEE" },
  });
};
