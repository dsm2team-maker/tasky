import { apiClient } from "@/lib/api-client";
import { routes } from "@/config/routes";
import type { Message, Participant } from "@/services/message.service";

export interface ConversationSummary {
  id: string;
  other: { id: string; firstName: string; lastName: string; avatar: string | null };
  lastMessage: Message | null;
  createdAt: string;
}

export interface ConversationMessagesData {
  messages: Message[];
  participants: {
    client: Participant;
    prestataire: Participant;
  };
}

export const conversationService = {
  start: (prestataireId: string) =>
    apiClient.post<{ success: boolean; data: { id: string } }>(routes.api.conversations.start, {
      prestataireId,
    }),

  getConversations: () =>
    apiClient.get<{ success: boolean; data: ConversationSummary[] }>(routes.api.conversations.list),

  getMessages: (conversationId: string) =>
    apiClient.get<{ success: boolean; data: ConversationMessagesData }>(
      routes.api.conversations.detail(conversationId),
    ),

  sendMessage: (conversationId: string, contenu: string) =>
    apiClient.post<{ success: boolean; data: Message }>(routes.api.conversations.detail(conversationId), {
      contenu,
    }),

  getUnreadByConversation: () =>
    apiClient.get<{ success: boolean; data: Record<string, number> }>(
      routes.api.conversations.unreadByConversation,
    ),
};
