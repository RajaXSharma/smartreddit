import type { AIProvider, Model } from './types';
import type { ScrapedContent, SummaryResponse, ChatMessage, ApiError } from '../types';
import { buildSummaryPrompt, buildChatMessages, parseSummaryResponse } from './prompts';

const OPENAI_MODELS: Model[] = [
  { id: 'gpt-4o', name: 'GPT-4o' },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo' },
];

const BASE_URL = 'https://api.openai.com/v1';

function parseError(status: number, body: unknown): ApiError {
  if (status === 401) {
    return { type: 'INVALID_KEY', message: 'Invalid API key. Check your key in settings.' };
  }
  if (status === 429) {
    const retryAfter = typeof body === 'object' && body !== null && 'error' in body
      ? 60
      : 60;
    return { type: 'RATE_LIMITED', message: `Rate limited. Try again in ${retryAfter} seconds.`, retryAfter };
  }
  if (status === 402 || status === 403) {
    return { type: 'QUOTA_EXCEEDED', message: 'API quota exceeded. Check your usage.' };
  }
  return { type: 'NETWORK_ERROR', message: 'Connection failed.' };
}

export const openaiProvider: AIProvider = {
  id: 'openai',
  name: 'OpenAI',
  models: OPENAI_MODELS,

  async generateSummary(content: ScrapedContent, apiKey: string, model: string): Promise<SummaryResponse> {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: 'user', content: buildSummaryPrompt(content) }],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw parseError(response.status, body);
    }

    const data = await response.json();
    const text = data.choices[0]?.message?.content;
    if (!text) {
      throw { type: 'PARSE_ERROR', message: 'Failed to parse response.' } as ApiError;
    }

    return parseSummaryResponse(text);
  },

  async *streamChat(
    content: ScrapedContent,
    messages: ChatMessage[],
    apiKey: string,
    model: string
  ): AsyncGenerator<string, void, unknown> {
    const response = await fetch(`${BASE_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: buildChatMessages(content, messages),
        stream: true,
      }),
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw parseError(response.status, body);
    }

    const reader = response.body?.getReader();
    if (!reader) throw { type: 'NETWORK_ERROR', message: 'No response body.' } as ApiError;

    const decoder = new TextDecoder();
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        const data = line.slice(6);
        if (data === '[DONE]') return;

        try {
          const parsed = JSON.parse(data);
          const content = parsed.choices[0]?.delta?.content;
          if (content) yield content;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  },

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/models`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      });
      return response.ok;
    } catch {
      return false;
    }
  },
};
