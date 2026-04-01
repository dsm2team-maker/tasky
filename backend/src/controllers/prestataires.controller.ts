import { Request, Response } from "express";
import { prisma } from "../lib/prisma";

// =============================================
// GET /api/prestataires/:id
// Profil public d'un prestataire
// =============================================
export const getPublicPrestataire = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const prestataire = await prisma.prestataire.findUnique({
      where: { id },
      select: {
        id: true,
        bio: true,
        rating: true,
        reviewCount: true,
        disponibilite: true,
        pointDepotAdresse: true,
        pointDepotVille: true,
        pointDepotCodePostal: true,
        pointDepotInstructions: true,
        tauxReussite: true,
        delaiMoyen: true,
        tempsReponse: true,
        user: {
          select: {
            firstName: true,
            city: true,
            avatar: true,
            createdAt: true,
          },
        },
        competences: {
          select: {
            id: true,
            categoryId: true,
            category: {
              select: {
                id: true,
                nom: true,
                icon: true,
                slug: true,
              },
            },
          },
        },
        prestations: {
          where: { status: "TERMINEE" },
          select: { id: true },
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            client: {
              select: {
                user: {
                  select: {
                    firstName: true,
                    avatar: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!prestataire) {
      return res.status(404).json({
        success: false,
        message: "Prestataire introuvable",
      });
    }

    return res.json({
      success: true,
      data: {
        id: prestataire.id,
        firstName: prestataire.user.firstName,
        city: prestataire.user.city,
        avatar: prestataire.user.avatar,
        bio: prestataire.bio,
        rating: prestataire.rating,
        reviewCount: prestataire.reviewCount,
        disponibilite: prestataire.disponibilite,
        pointDepotAdresse: prestataire.pointDepotAdresse,
        pointDepotVille: prestataire.pointDepotVille,
        pointDepotCodePostal: prestataire.pointDepotCodePostal,
        pointDepotInstructions: prestataire.pointDepotInstructions,
        tauxReussite: prestataire.tauxReussite,
        delaiMoyen: prestataire.delaiMoyen,
        tempsReponse: prestataire.tempsReponse,
        nbPrestations: prestataire.prestations.length,
        memberSince: prestataire.user.createdAt,
        competences: prestataire.competences,
        reviews: prestataire.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          comment: r.comment,
          createdAt: r.createdAt,
          clientFirstName: r.client.user.firstName,
          clientAvatar: r.client.user.avatar,
        })),
      },
    });
  } catch (error) {
    console.error("Erreur getPublicPrestataire:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};

// =============================================
// GET /api/prestataires
// Liste des prestataires (recherche)
// =============================================
export const listPrestataires = async (req: Request, res: Response) => {
  try {
    const { city, categoryId } = req.query as {
      city?: string;
      categoryId?: string;
    };

    const prestataires = await prisma.prestataire.findMany({
      where: {
        // Seulement les prestataires avec profil complet
        bio: { not: null },
        pointDepotAdresse: { not: null },
        disponibilite: { in: ["ACTIF", "OCCUPE"] },
        competences: { some: {} },
        ...(city && {
          user: { city: { contains: city, mode: "insensitive" } },
        }),
        ...(categoryId && { competences: { some: { categoryId } } }),
      },
      select: {
        id: true,
        bio: true,
        rating: true,
        reviewCount: true,
        disponibilite: true,
        pointDepotVille: true,
        tauxReussite: true,
        delaiMoyen: true,
        user: {
          select: {
            firstName: true,
            city: true,
            avatar: true,
            createdAt: true,
          },
        },
        competences: {
          select: {
            category: {
              select: { id: true, nom: true, icon: true },
            },
          },
        },
        prestations: {
          where: { status: "TERMINEE" },
          select: { id: true },
        },
      },
      orderBy: { rating: "desc" },
    });

    return res.json({
      success: true,
      data: prestataires.map((p) => ({
        id: p.id,
        firstName: p.user.firstName,
        city: p.user.city,
        avatar: p.user.avatar,
        bio: p.bio ? p.bio.substring(0, 120) + "..." : null,
        rating: p.rating,
        reviewCount: p.reviewCount,
        disponibilite: p.disponibilite,
        pointDepotVille: p.pointDepotVille,
        tauxReussite: p.tauxReussite,
        delaiMoyen: p.delaiMoyen,
        nbPrestations: p.prestations.length,
        memberSince: p.user.createdAt,
        competences: p.competences.map((c) => c.category),
      })),
    });
  } catch (error) {
    console.error("Erreur listPrestataires:", error);
    return res.status(500).json({ success: false, message: "Erreur serveur" });
  }
};
