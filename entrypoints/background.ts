export default defineBackground(() => {
  console.log('Reddit Summarizer: Background script loaded');

  // Open side panel when extension icon is clicked
  browser.action.onClicked.addListener(async (tab) => {
    if (tab.id) {
      await browser.sidePanel.open({ tabId: tab.id });
    }
  });

  // Set side panel behavior
  browser.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
