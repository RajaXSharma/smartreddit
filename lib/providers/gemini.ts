import type { AIProvider, Model } from './types';
import type { ScrapedContent, SummaryResponse, ChatMessage, ApiError } from '../types';
import { buildSummaryPrompt, buildChatSystemPrompt, parseSummaryResponse } from './prompts';

const GEMINI_MODELS: Model[] = [
  { id: 'gemini-2.5-flash-lite', name: 'Gemini 2.5 Flash Lite' },
];

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

function parseError(status: number): ApiError {
  if (status === 400 || status === 401) {
    return { type: 'INVALID_KEY', message: 'Invalid API key. Check your key in settings.' };
  }
  if (status === 429) {
    return { type: 'RATE_LIMITED', message: 'Rate limited. Try again in 60 seconds.', retryAfter: 60 };
  }
  if (status === 403) {
    return { type: 'QUOTA_EXCEEDED', message: 'API quota exceeded. Check your usage.' };
  }
  return { type: 'NETWORK_ERROR', message: 'Connection failed.' };
}

function buildGeminiMessages(content: ScrapedContent, messages: ChatMessage[]): Array<{ role: string; parts: Array<{ text: string }> }> {
  const systemPrompt = buildChatSystemPrompt(content);
  const result: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    const role = msg.role === 'assistant' ? 'model' : 'user';
    const text = i === 0 ? `${systemPrompt}\n\n${msg.content}` : msg.content;
    result.push({ role, parts: [{ text }] });
  }

  return result;
}

export const geminiProvider: AIProvider = {
  id: 'gemini',
  name: 'Google Gemini',
  models: GEMINI_MODELS,

  async generateSummary(content: ScrapedContent, apiKey: string, model: string): Promise<SummaryResponse> {
    const response = await fetch(
      `${BASE_URL}/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: buildSummaryPrompt(content) }] }],
          generationConfig: { temperature: 0.3 },
        }),
      }
    );

    if (!response.ok) {
      throw parseError(response.status);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
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
    const response = await fetch(
      `${BASE_URL}/models/${model}:streamGenerateContent?key=${apiKey}&alt=sse`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: buildGeminiMessages(content, messages),
        }),
      }
    );

    if (!response.ok) {
      throw parseError(response.status);
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
        const data = line.slice(6).trim();
        if (!data) continue;

        try {
          const parsed = JSON.parse(data);
          const text = parsed.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) yield text;
        } catch {
          // Skip malformed JSON
        }
      }
    }
  },

  async validateKey(apiKey: string): Promise<boolean> {
    try {
      const response = await fetch(`${BASE_URL}/models?key=${apiKey}`);
      return response.ok;
    } catch {
      return false;
    }
  },
};
