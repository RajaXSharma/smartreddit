import type { ScrapedContent, SummaryResponse, ChatMessage } from './types';
import { getProvider } from './providers';
import { getApiKey, getSettings } from './storage';

export async function fetchSummary(content: ScrapedContent): Promise<SummaryResponse> {
  const settings = await getSettings();
  if (!settings) throw new Error('Settings not initialized');

  const apiKey = await getApiKey(settings.activeProvider);
  if (!apiKey) {
    throw {
      type: 'INVALID_KEY',
      message: 'No API key configured. Add one in settings.',
    };
  }

  const provider = getProvider(settings.activeProvider);
  return provider.generateSummary(content, apiKey, settings.activeModel);
}

export async function* streamChatMessage(
  content: ScrapedContent,
  messages: ChatMessage[]
): AsyncGenerator<string, void, unknown> {
  const settings = await getSettings();
  if (!settings) throw new Error('Settings not initialized');

  const apiKey = await getApiKey(settings.activeProvider);
  if (!apiKey) {
    throw {
      type: 'INVALID_KEY',
      message: 'No API key configured. Add one in settings.',
    };
  }

  const provider = getProvider(settings.activeProvider);
  yield* provider.streamChat(content, messages, apiKey, settings.activeModel);
}
