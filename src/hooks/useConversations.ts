import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { conversationService } from "@/services/conversation.service";
import { useAuthStore } from "@/stores/auth-store";
import type { ConversationMessagesData } from "@/services/conversation.service";
import type { Message } from "@/services/message.service";
import { queryKeys } from "@/config/query-keys";

export const useConversations = () =>
  useQuery({
    queryKey: queryKeys.conversations,
    queryFn: () => conversationService.getConversations().then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: 5_000,
  });

export const useUnreadByConversation = () =>
  useQuery({
    queryKey: queryKeys.conversationsUnreadByConversation,
    queryFn: () => conversationService.getUnreadByConversation().then((r) => r.data.data),
    staleTime: 0,
    refetchInterval: 5_000,
  });

export const useConversationMessages = (conversationId: string | undefined) => {
  const queryClient = useQueryClient();
  return useQuery({
    queryKey: queryKeys.conversation(conversationId ?? ""),
    queryFn: async () => {
      const result = await conversationService.getMessages(conversationId!).then((r) => r.data.data);
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsUnreadByConversation });
      return result;
    },
    enabled: !!conversationId,
    staleTime: 0,
    refetchInterval: 2_000,
  });
};

export const useStartConversation = () =>
  useMutation({
    mutationFn: (prestataireId: string) =>
      conversationService.start(prestataireId).then((r) => r.data.data),
  });

export const useSendConversationMessage = (conversationId: string) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  type MutationContext = { previous: ConversationMessagesData | undefined };
  return useMutation<Message, unknown, string, MutationContext>({
    mutationFn: (contenu: string) =>
      conversationService.sendMessage(conversationId, contenu).then((r) => r.data.data),

    onMutate: async (contenu: string) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.conversation(conversationId) });
      const previous = queryClient.getQueryData<ConversationMessagesData>(
        queryKeys.conversation(conversationId),
      );

      queryClient.setQueryData<ConversationMessagesData>(queryKeys.conversation(conversationId), (old) => {
        if (!old) return old;
        return {
          ...old,
          messages: [
            ...old.messages,
            {
              id: `temp-${Date.now()}`,
              prestationId: null,
              conversationId,
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
      if (context?.previous) queryClient.setQueryData(queryKeys.conversation(conversationId), context.previous);
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.conversation(conversationId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.messagesUnreadCount });
      queryClient.invalidateQueries({ queryKey: queryKeys.conversationsUnreadByConversation });
    },
  });
};
