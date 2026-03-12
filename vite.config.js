import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const repo = process.env.GITHUB_REPOSITORY?.split('/')?.[1] || '';
  const isGitHubPages = process.env.GITHUB_ACTIONS === 'true';

  return {
    plugins: [react()],
    base: isGitHubPages && repo ? `/${repo}/` : '/',
  };
});
