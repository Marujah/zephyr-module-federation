import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import federation from '@originjs/vite-plugin-federation';
import { withZephyr } from 'vite-plugin-zephyr';

export default defineConfig(() => {
  const plugins = [
    vue(),
    federation({
      name: 'vue_remote',
      filename: 'remoteEntry.js',
      exposes: {
        './mount': './src/bootstrap.ts',
      },
      shared: ['vue'],
    }),
  ];

  if (process.env.ENABLE_ZEPHYR === '1') {
    plugins.push(withZephyr());
  }

  return {
    server: {
      port: 5175,
      strictPort: true,
    },
    plugins,
    build: {
      target: 'esnext',
    },
  };
});
