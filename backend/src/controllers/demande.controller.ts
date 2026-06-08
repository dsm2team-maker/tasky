import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import { createDemande, getMyDemandes, getDemande, deleteDemande } from "../modules/demandes/demande.service";

export const createDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const {
      titre, description, typePrestation, categoryId, subCategoryId,
      budget, ville, photos, delaiJours, urgence, interventionIds,
    } = req.body;

    if (!titre || titre.trim().length < 5)
      return res.status(400).json({ success: false, message: "Titre trop court (min 5 caractères)" });
    if (!description || description.trim().length < 20)
      return res.status(400).json({ success: false, message: "Description trop courte (min 20 caractères)" });
    if (!typePrestation || !["MODIFICATION", "CREATION", "FORMATION"].includes(typePrestation))
      return res.status(400).json({ success: false, message: "Type de prestation invalide" });
    if (!categoryId)
      return res.status(400).json({ success: false, message: "Catégorie requise" });
    if (photos && photos.length > 2)
      return res.status(400).json({ success: false, message: "Maximum 2 photos" });

    const budgetParsed = budget !== undefined && budget !== null && budget !== "" ? parseFloat(budget) : undefined;
    if (budgetParsed !== undefined && (isNaN(budgetParsed) || budgetParsed <= 0))
      return res.status(400).json({ success: false, message: "Le budget doit être supérieur à 0 €" });

    const delaiJoursParsed = delaiJours !== undefined ? parseInt(delaiJours, 10) : undefined;
    if (!delaiJoursParsed || isNaN(delaiJoursParsed) || delaiJoursParsed < 1 || delaiJoursParsed > 365)
      return res.status(400).json({ success: false, message: "Délai requis (entre 1 et 365 jours)" });

    const demande = await createDemande(req.user!.userId, {
      titre: titre.trim(),
      description: description.trim(),
      typePrestation,
      categoryId,
      subCategoryId,
      interventionIds,
      budget: budgetParsed,
      ville,
      photos: photos || [],
      delaiJours: delaiJoursParsed,
      urgence: urgence || "NORMAL",
    });

    return res.status(201).json({ success: true, message: "Demande créée avec succès", data: demande });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMyDemandesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await getMyDemandes(req.user!.userId);
    return res.json({ success: true, data: demandes });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demande = await getDemande(req.user!.userId, req.params.id);
    return res.json({ success: true, data: demande });
  } catch (error) {
    return handleError(error, res);
  }
};

export const deleteDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    await deleteDemande(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Demande supprimée" });
  } catch (error) {
    return handleError(error, res);
  }
};
