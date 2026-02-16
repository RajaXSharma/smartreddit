import type { ScrapedContent, SummaryResponse, ChatMessage } from './types';

// Mock delay to simulate network
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchSummary(
  _content: ScrapedContent
): Promise<SummaryResponse> {
  await delay(1500);

  // Mock response
  return {
    tldr: [
      'The OP is discussing the rapid evolution of AI art styles specifically within Midjourney v6.',
      'Community sentiment is mixed between awe at the technology and concern for traditional artist displacement.',
      'Top comments highlight the "uncanny valley" effect is diminishing rapidly.',
    ],
    quote:
      'The most surprising part is how quickly we adapted to seeing things that are impossible.',
    sentiment: {
      positive: 70,
      neutral: 20,
      negative: 10,
    },
  };
}

export async function sendChatMessage(
  _content: ScrapedContent,
  _messages: ChatMessage[],
  userMessage: string
): Promise<ChatMessage> {
  await delay(1000);

  // Mock response based on user message
  const responses: Record<string, string> = {
    default:
      "Based on the post and comments, I can help answer questions about this discussion. What would you like to know?",
  };

  return {
    role: 'assistant',
    content:
      responses[userMessage.toLowerCase()] ||
      `Based on the discussion, ${userMessage.toLowerCase().includes('price') ? 'several commenters mention pricing concerns, particularly around the subscription model.' : 'the community has varied opinions on this topic. Would you like me to elaborate on any specific aspect?'}`,
  };
}
