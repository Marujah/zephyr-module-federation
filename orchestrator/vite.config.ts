import { defineConfig, loadEnv } from 'vite';
import federation from '@originjs/vite-plugin-federation';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const reactRemoteEntry =
    env.VITE_REACT_REMOTE_ENTRY ?? 'http://localhost:5174/assets/remoteEntry.js';
  const vueRemoteEntry =
    env.VITE_VUE_REMOTE_ENTRY ?? 'http://localhost:5175/assets/remoteEntry.js';

  return {
    server: {
      port: 5173,
      strictPort: true,
    },
    plugins: [
      federation({
        name: 'orchestrator',
        remotes: {
          react_remote: reactRemoteEntry,
          vue_remote: vueRemoteEntry,
        },
      }) as any,
    ],
    build: {
      target: 'esnext',
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (!id.includes('node_modules')) {
              return;
            }

            if (id.includes('@angular/core')) return 'ng-core';
            if (id.includes('@angular/common')) return 'ng-common';
            if (id.includes('@angular/platform-browser')) return 'ng-platform';
            if (id.includes('@angular/compiler')) return 'ng-compiler';
            if (id.includes('rxjs')) return 'rxjs';
            if (id.includes('zone.js')) return 'zonejs';

            return 'vendor';
          },
        },
      },
    },
  };
});
