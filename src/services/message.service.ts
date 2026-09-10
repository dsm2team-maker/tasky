import { apiClient } from "@/lib/api-client";

export interface Message {
  id: string;
  prestationId: string | null;
  conversationId?: string | null;
  destinataireId?: string | null;
  auteurId: string | null;
  contenu: string;
  lu: boolean;
  isSystem: boolean;
  createdAt: string;
  prestation?: { id: string; demandeId: string } | null;
}

export interface Participant {
  id: string;
  firstName: string;
  avatar: string | null;
}

export interface MessagesData {
  messages: Message[];
  participants: {
    client: Participant;
    prestataire: Participant;
  };
}

export const messageService = {
  getMessages: (prestationId: string) =>
    apiClient.get<{ success: boolean; data: MessagesData }>(
      `/api/messages/${prestationId}`,
    ),

  sendMessage: (prestationId: string, contenu: string) =>
    apiClient.post<{ success: boolean; data: Message }>(
      `/api/messages/${prestationId}`,
      { contenu },
    ),

  getUnreadCount: () =>
    apiClient.get<{ success: boolean; data: { count: number } }>(
      `/api/messages/unread-count`,
    ),

  getUnreadByPrestation: () =>
    apiClient.get<{ success: boolean; data: Record<string, number> }>(
      `/api/messages/unread-by-prestation`,
    ),

  getTaskyInfo: () =>
    apiClient.get<{ success: boolean; data: Message[] }>(`/api/messages/tasky-info`),

  getTaskyInfoUnreadCount: () =>
    apiClient.get<{ success: boolean; data: { count: number } }>(
      `/api/messages/tasky-info/unread-count`,
    ),
};
