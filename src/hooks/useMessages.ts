import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { messageService } from "@/services/message.service";
import { useAuthStore } from "@/stores/auth-store";
import type { Message, MessagesData } from "@/services/message.service";
import { queryKeys } from "@/config/query-keys";

export const useUnreadMessageCount = () =>
  useQuery({
    queryKey: queryKeys.messagesUnreadCount,
    queryFn: () => messageService.getUnreadCount().then((r) => r.data.data.count),
    staleTime: 0,
    refetchInterval: 5_000,
  });

export const useUnreadByPrestation = () =>
  useQuery({
    queryKey: queryKeys.messagesUnreadByPrestation,
    queryFn: () => messageService.getUnreadByPrestation().then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: 5_000,
  });

export const useMessages = (prestationId: string | undefined) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.messages(prestationId ?? ""),
    queryFn: async () => {
      const result = await messageService.getMessages(prestationId!).then((r) => r.data.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadByPrestation });
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
      await queryClient.cancelQueries({ queryKey: queryKeys.messages(prestationId) });
      const previous = queryClient.getQueryData<MessagesData>(queryKeys.messages(prestationId));

      queryClient.setQueryData<MessagesData>(queryKeys.messages(prestationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            { id: `temp-${Date.now()}`, prestationId, auteurId: user?.id ?? "", contenu, lu: false, isSystem: false, createdAt: new Date().toISOString() },
          ],
        };
      });
      return { previous };
    },

    onError: (_err: unknown, _vars: string, context: MutationContext | undefined) => {
      if (context?.previous) queryClient.setQueryData(queryKeys.messages(prestationId), context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.messages(prestationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadByPrestation });
    },
  });
};
