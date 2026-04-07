import type { ScrapedContent, SummaryResponse, ChatMessage, ProviderId } from '../types';

export interface Model {
  id: string;
  name: string;
}

export interface AIProvider {
  id: ProviderId;
  name: string;
  models: Model[];
  generateSummary(
    content: ScrapedContent,
    apiKey: string,
    model: string
  ): Promise<SummaryResponse>;
  streamChat(
    content: ScrapedContent,
    messages: ChatMessage[],
    apiKey: string,
    model: string
  ): AsyncGenerator<string, void, unknown>;
  validateKey(apiKey: string): Promise<boolean>;
}

export interface ProviderConfig {
  baseUrl: string;
  models: Model[];
}
