import type { AIProvider } from './types';
import type { ProviderId } from '../types';
import { geminiProvider } from './gemini';

export type { AIProvider, Model, ProviderConfig } from './types';

export const providers: Record<ProviderId, AIProvider> = {
  gemini: geminiProvider,
};

export const providerList: AIProvider[] = [geminiProvider];

export function getProvider(id: ProviderId): AIProvider {
  const provider = providers[id];
  if (!provider) {
    throw new Error(`Unknown provider: ${id}`);
  }
  return provider;
}

export function getDefaultModel(providerId: ProviderId): string {
  const provider = getProvider(providerId);
  return provider.models[0].id;
}
