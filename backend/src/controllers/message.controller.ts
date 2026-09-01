import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { handleError } from "../utils/errorHandler";
import {
  getMessages,
  sendMessage,
  getUnreadCount,
  getUnreadByPrestation,
  startConversation,
  getConversations,
  getConversationMessages,
  sendConversationMessage,
  getUnreadByConversation,
} from "../modules/messages/message.service";

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

// =============================================================================
// CONVERSATIONS DIRECTES
// =============================================================================

export const startConversationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const conversation = await startConversation(req.user!.userId, req.body.prestataireId);
    res.status(201).json({ success: true, data: conversation });
  } catch (error) {
    handleError(error, res);
  }
};

export const getConversationsHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getConversations(req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
};

export const getUnreadByConversationHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getUnreadByConversation(req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
};

export const getConversationMessagesHandler = async (req: AuthRequest, res: Response) => {
  try {
    const data = await getConversationMessages(req.params.conversationId, req.user!.userId);
    res.json({ success: true, data });
  } catch (error) {
    handleError(error, res);
  }
};

export const sendConversationMessageHandler = async (req: AuthRequest, res: Response) => {
  try {
    const message = await sendConversationMessage(
      req.params.conversationId,
      req.user!.userId,
      req.body.contenu,
    );
    res.status(201).json({ success: true, data: message });
  } catch (error) {
    handleError(error, res);
  }
};
