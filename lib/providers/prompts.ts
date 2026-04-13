import type { ScrapedContent, SummaryResponse, ChatMessage } from '../types';

export function buildSummaryPrompt(content: ScrapedContent): string {
  const commentsText = content.comments
    .slice(0, 30)
    .map((c) => `- [${c.score}] u/${c.author}: ${c.text.slice(0, 200)}`)
    .join('\n');

  return `You are analyzing a Reddit post and its comments. Provide a structured summary.

POST:
Title: ${content.title}
Subreddit: ${content.subreddit}
Content: ${content.body || '(no body text)'}

COMMENTS (${content.comments.length} total, sorted by score):
${commentsText}

Respond ONLY with valid JSON in this exact format:
{
  "tldr": ["key point 1", "key point 2", "key point 3"],
  "quote": "most insightful or representative quote from the comments",
  "sentiment": {
    "positive": <number 0-100>,
    "neutral": <number 0-100>,
    "negative": <number 0-100>
  }
}

Rules:
- tldr must have exactly 3 concise bullet points
- sentiment values must sum to 100
- quote must be an actual quote from the comments`;
}

export function buildChatSystemPrompt(content: ScrapedContent): string {
  const commentsText = content.comments
    .slice(0, 20)
    .map((c) => `[${c.score}] u/${c.author}: ${c.text.slice(0, 150)}`)
    .join('\n');

  return `You are a helpful assistant discussing a Reddit post. Answer questions based on the post content and comments provided below. Be concise and cite specific comments when relevant.

---
POST: ${content.title}
Subreddit: ${content.subreddit}
Content: ${content.body || '(no body text)'}

COMMENTS:
${commentsText}
---`;
}

export function buildChatMessages(
  content: ScrapedContent,
  messages: ChatMessage[]
): Array<{ role: string; content: string }> {
  return [
    { role: 'system', content: buildChatSystemPrompt(content) },
    ...messages.map((m) => ({ role: m.role, content: m.content })),
  ];
}

export function parseSummaryResponse(text: string): SummaryResponse {
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw { type: 'PARSE_ERROR', message: 'Failed to parse response.' };
  }

  const parsed = JSON.parse(jsonMatch[0]);

  if (
    !Array.isArray(parsed.tldr) ||
    parsed.tldr.length !== 3 ||
    typeof parsed.quote !== 'string' ||
    typeof parsed.sentiment?.positive !== 'number'
  ) {
    throw { type: 'PARSE_ERROR', message: 'Invalid response format.' };
  }

  return {
    tldr: parsed.tldr,
    quote: parsed.quote,
    sentiment: {
      positive: parsed.sentiment.positive,
      neutral: parsed.sentiment.neutral,
      negative: parsed.sentiment.negative,
    },
  };
}
