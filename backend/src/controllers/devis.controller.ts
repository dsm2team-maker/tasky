import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import { parseMontant, parseDelai, MONTANT_MIN, MONTANT_MAX, DELAI_MAX_JOURS, DESCRIPTION_DEVIS_MAX } from "../utils/montant.validation";
import {
  getDemandesDisponibles,
  getDemandeDetail,
  envoyerDevis,
  getDevisDemande,
  accepterDevis,
  refuserDevis,
  getMesStatsDevis,
  getMesDevisRefuses,
  getMesDevis,
  dismisserDevis,
  ignorerDemande,
} from "../modules/devis/devis.service";

export const getDemandesDisponiblesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demandes = await getDemandesDisponibles(req.user!.userId);
    return res.json({ success: true, data: demandes });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getDemandeDetailHandler = async (req: AuthRequest, res: Response) => {
  try {
    const demande = await getDemandeDetail(req.user!.userId, req.params.id);
    return res.json({ success: true, data: demande });
  } catch (error) {
    return handleError(error, res);
  }
};

export const ignorerDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    await ignorerDemande(req.user!.userId, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return handleError(error, res);
  }
};

export const envoyerDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const { montant, delai, description } = req.body;

    const montantValide = parseMontant(montant);
    if (montantValide === null)
      return res.status(400).json({ success: false, message: `Montant invalide : entre ${MONTANT_MIN} € et ${MONTANT_MAX} €, 2 décimales maximum.` });
    const delaiValide = parseDelai(delai);
    if (delaiValide === null)
      return res.status(400).json({ success: false, message: `Délai invalide : nombre entier de jours entre 1 et ${DELAI_MAX_JOURS}.` });
    if (typeof description !== "string" || description.trim().length < 20)
      return res.status(400).json({ success: false, message: "Description trop courte (min 20 caractères)" });
    if (description.trim().length > DESCRIPTION_DEVIS_MAX)
      return res.status(400).json({ success: false, message: `Description trop longue (max ${DESCRIPTION_DEVIS_MAX} caractères)` });

    const devis = await envoyerDevis(req.user!.userId, req.params.id, {
      montant: montantValide,
      delai: delaiValide,
      description: description.trim(),
    });
    return res.status(201).json({ success: true, message: "Devis envoyé", data: devis });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getDevisDemandeHandler = async (req: AuthRequest, res: Response) => {
  try {
    const result = await getDevisDemande(req.user!.userId, req.params.id);
    return res.json({ success: true, data: result });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesStatsDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getMesStatsDevis(req.user!.userId);
    return res.json({ success: true, data: stats });
  } catch (error) {
    return handleError(error, res);
  }
};

export const accepterDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await accepterDevis(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Devis accepté — prestation créée" });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesDevisRefusesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMesDevisRefuses(req.user!.userId);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(error, res);
  }
};

export const getMesDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMesDevis(req.user!.userId);
    return res.json({ success: true, data });
  } catch (error) {
    return handleError(error, res);
  }
};

export const dismisserDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await dismisserDevis(req.user!.userId, req.params.id);
    return res.json({ success: true });
  } catch (error) {
    return handleError(error, res);
  }
};

export const refuserDevisHandler = async (req: AuthRequest, res: Response) => {
  try {
    await refuserDevis(req.user!.userId, req.params.id);
    return res.json({ success: true, message: "Devis refusé" });
  } catch (error) {
    return handleError(error, res);
  }
};
