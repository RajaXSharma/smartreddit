import { useMutation, useQueryClient } from '@tanstack/react-query';
import { streamChatMessage } from '../lib/api';
import type { ScrapedContent, ChatMessage } from '../lib/types';

interface MutationContext {
  previousMessages?: ChatMessage[];
}

export function useChatMutation(
  postUrl: string,
  content: ScrapedContent | null,
  onStreamStart?: () => void,
  onStreamEnd?: () => void
) {
  const queryClient = useQueryClient();

  return useMutation<void, Error, { messages: ChatMessage[]; userMessage: string }, MutationContext>({
    mutationFn: async ({ messages, userMessage }) => {
      if (!content) throw new Error('No content available');

      onStreamStart?.();

      const allMessages: ChatMessage[] = [...messages, { role: 'user', content: userMessage }];

      // Add placeholder for streaming response
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], [
        ...allMessages,
        { role: 'assistant', content: '', isStreaming: true },
      ]);

      let fullResponse = '';

      try {
        for await (const chunk of streamChatMessage(content, allMessages)) {
          fullResponse += chunk;
          queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], [
            ...allMessages,
            { role: 'assistant', content: fullResponse, isStreaming: true },
          ]);
        }

        // Finalize the message
        queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], [
          ...allMessages,
          { role: 'assistant', content: fullResponse, isStreaming: false },
        ]);
      } finally {
        onStreamEnd?.();
      }
    },
    onMutate: async ({ userMessage }) => {
      await queryClient.cancelQueries({ queryKey: ['chat', postUrl] });

      const previousMessages = queryClient.getQueryData<ChatMessage[]>(['chat', postUrl]);

      // Optimistically add user message
      queryClient.setQueryData<ChatMessage[]>(['chat', postUrl], (old = []) => [
        ...old,
        { role: 'user', content: userMessage },
      ]);

      return { previousMessages };
    },
    onError: (_err, _variables, context) => {
      onStreamEnd?.();
      if (context?.previousMessages) {
        queryClient.setQueryData(['chat', postUrl], context.previousMessages);
      }
    },
  });
}
