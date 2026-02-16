import { defineConfig } from 'wxt';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  manifest: {
    name: 'Reddit Summarizer',
    description: 'AI-powered summaries and chat for Reddit posts',
    permissions: ['sidePanel', 'storage', 'activeTab'],
    host_permissions: ['*://*.reddit.com/*'],
    action: {
      default_title: 'Open Reddit Summarizer',
    },
    side_panel: {
      default_path: 'sidepanel/index.html',
    },
  },
  vite: () => ({
    plugins: [tailwindcss()],
  }),
});
