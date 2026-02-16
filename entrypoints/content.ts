export default defineContentScript({
  matches: ['*://*.reddit.com/*'],
  main() {
    console.log('Reddit Summarizer: Content script loaded');

    // Listen for messages from side panel
    browser.runtime.onMessage.addListener((message, _sender, sendResponse) => {
      if (message.type === 'GET_CONTENT') {
        // For now, return mock data
        // Real implementation will scrape the DOM
        sendResponse({
          success: true,
          content: {
            title: document.title,
            url: window.location.href,
          },
        });
      }
      return true;
    });
  },
});
