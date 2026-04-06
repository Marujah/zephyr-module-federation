import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {withZephyr} from 'vite-plugin-zephyr';
import Inspect from 'vite-plugin-inspect';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(() => {
  const isMfWatchMode = process.env.MF_DEV === '1';

  const plugins = [
    react(),
    federation({
      name: 'react_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './mount': './src/bootstrap.tsx',
      },
      shared: ['react', 'react-dom'],
    }),
    // Inspect plugin can crash on watch rebuilds when dist is refreshed.
    !isMfWatchMode ? Inspect({ build: true, outputDir: 'dist/.vite-inspect' }) : null,
  ];

  if (process.env.ENABLE_ZEPHYR === '1') {
    plugins.push(withZephyr());
  }

  return {
    server: {
      port: 5174,
      strictPort: true,
    },
    plugins: plugins.filter(Boolean),
    build: {
      target: 'esnext',
    },
  };
});
