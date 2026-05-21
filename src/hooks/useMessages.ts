import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Message, MessagesData } from "@/services/message.service";

const MESSAGES_KEY = (prestationId: string) => ["messages", prestationId];

export const useUnreadMessageCount = () => {
  return useQuery({
    queryKey: ["messages-unread-count"],
    queryFn: () =>
      messageService.getUnreadCount().then((r) => r.data.data.count),
    staleTime: 0,
    refetchInterval: 5_000,
  });
};

export const useUnreadByPrestation = () => {
  return useQuery({
    queryKey: ["messages-unread-by-prestation"],
    queryFn: () =>
      messageService.getUnreadByPrestation().then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: 5_000,
  });
};

export const useMessages = (prestationId: string | undefined) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: MESSAGES_KEY(prestationId ?? ""),
    queryFn: async () => {
      const result = await messageService.getMessages(prestationId!).then((r) => r.data.data);
      // Les messages viennent d'être marqués comme lus côté backend — invalider les compteurs
      queryClient.invalidateQueries({ queryKey: ["messages-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["messages-unread-by-prestation"] });
      return result;
    },
    enabled: !!prestationId,
    staleTime: 0,
    refetchInterval: 2_000,
  });
};

export const useSendMessage = (prestationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  type MutationContext = { previous: MessagesData | undefined };
  return useMutation<Message, unknown, string, MutationContext>({
    mutationFn: (contenu: string) =>
      messageService.sendMessage(prestationId, contenu).then((r) => r.data.data),

    onMutate: async (contenu: string) => {
      await queryClient.cancelQueries({ queryKey: MESSAGES_KEY(prestationId) });
      const previous = queryClient.getQueryData<MessagesData>(MESSAGES_KEY(prestationId));

      queryClient.setQueryData<MessagesData>(MESSAGES_KEY(prestationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: `temp-${Date.now()}`,
              prestationId,
              auteurId: user?.id ?? "",
              contenu,
              lu: false,
              isSystem: false,
              createdAt: new Date().toISOString(),
            },
          ],
        };
      });

      return { previous };
    },

    onError: (_err: unknown, _vars: string, context: MutationContext | undefined) => {
      if (context?.previous) {
        queryClient.setQueryData(MESSAGES_KEY(prestationId), context.previous);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: MESSAGES_KEY(prestationId) });
      queryClient.invalidateQueries({ queryKey: ["messages-unread-count"] });
      queryClient.invalidateQueries({ queryKey: ["messages-unread-by-prestation"] });
    },
  });
};
