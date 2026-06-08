import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import { getMessages, sendMessage, getUnreadCount, getUnreadByPrestation } from "../modules/messages/message.service";

export const getUnreadByPrestationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUnreadByPrestation(req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
};

export const getUnreadCountHandler = async (req: AuthRequest, res: Response) => {
  try {
    const count = await getUnreadCount(req.user!.userId);
    res.json({ success: true, data: { count } });
  } catch (error) {
    handleError(error, res);
  }
};

export const getMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getMessages(req.params.prestationId, req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
};

export const sendMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const message = await sendMessage(req.params.prestationId, req.user!.userId, req.body.contenu);
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    handleError(error, res);
  }
};
