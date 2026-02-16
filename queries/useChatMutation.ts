import { useMutation, useQueryClient } from '@tanstack/react-query';
import { sendChatMessage } from '../lib/api';
import type { ScrapedContent, ChatMessage } from '../lib/types';

export function useChatMutation(postUrl: string, content: ScrapedContent | null) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      messages,
      userMessage,
    }: {
      messages: ChatMessage[];
      userMessage: string;
    }) => {
      if (!content) throw new Error('No content available');
      return sendChatMessage(content, messages, userMessage);
    },
    onMutate: async ({ messages, userMessage }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['chat', postUrl] });

      // Snapshot previous value
      const previousMessages = queryClient.getQueryData<ChatMessage[]>([
        'chat',
        postUrl,
      ]);

      // Optimistically add user message
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], (old = []) => [
        ...old,
        { role: 'user', content: userMessage },
      ]);

      return { previousMessages };
    },
    onSuccess: (newMessage) => {
      // Add assistant response
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], (old = []) => [
        ...old,
        newMessage,
      ]);
    },
    onError: (_err, _variables, context) => {
      // Rollback on error
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', postUrl], context.previousMessages);
      }
    },
  });
}
