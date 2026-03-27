import { parseRedditJson } from '../lib/scraper';
import type { RedditResponse, ScrapeResult } from '../lib/types';

const POST_URL_REGEX = /^https?:\/\/(www\.)?reddit\.com\/r\/\w+\/comments\/\w+/;
const FETCH_TIMEOUT = 10000;

async function scrapeRedditPost(): Promise<ScrapeResult> {
  const url = window.location.href;

  if (!POST_URL_REGEX.test(url)) {
    return { success: false, error: 'NOT_POST_PAGE' };
  }

  try {
    const jsonUrl = url.split('?')[0].replace(/\/$/, '') + '.json';

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT);

    const response = await fetch(jsonUrl, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { success: false, error: 'FETCH_FAILED' };
    }

    const json: RedditResponse = await response.json();
    const content = parseRedditJson(json);

    return { success: true, content };
  } catch (error) {
    if (error instanceof SyntaxError) {
      return { success: false, error: 'PARSE_ERROR' };
    }
    return { success: false, error: 'FETCH_FAILED' };
  }
}

export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  main() {
    console.log('Reddit Summarizer: Content script loaded');

    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_CONTENT') {
        scrapeRedditPost().then(sendResponse);
        return true;
      }
    });
  },
});
