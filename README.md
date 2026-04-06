---
name: React + Vite
slug: bundlers/react-vite
description: React application with Vite bundler, deployed with Zephyr Cloud
framework: react
bundler: vite
features: []
complexity: beginner
---

# Vite Module Federation Workspace

This workspace now contains three Vite apps:

- `react-remote`: React remote exposed through Module Federation
- `vue-remote`: Vue remote exposed through Module Federation
- `orchestrator`: Host app that loads both remotes at runtime

## Technology Stack

- **Bundler**: Vite
- **Federation**: `@originjs/vite-plugin-federation`
- **React Remote**: React + TypeScript + `vite-plugin-zephyr`
- **Vue Remote**: Vue 3 + TypeScript
- **Host**: Angular standalone orchestrator (TypeScript)

## Prerequisites

- Node.js (version 16 or higher)
- pnpm (recommended) or npm

## Getting Started

1. **Install dependencies**

   ```bash
   pnpm install
   ```

2. **Start all apps (React + Vue + Orchestrator)**

   ```bash
   pnpm dev
   ```

   Apps run on `http://localhost:5173` (orchestrator host), `http://localhost:5174` (React remote), and `http://localhost:5175` (Vue remote).
   Dev servers use fixed ports (`strictPort`) so Module Federation remotes stay aligned.
   For remotes, dev mode uses `build --watch` + `vite preview` to ensure `remoteEntry.js` is available for the host.

   If startup fails with "Port ... is already in use", stop old dev servers and run `pnpm dev` again.

3. **Build each app individually**

   ```bash
   pnpm --filter react-remote build
   pnpm --filter vue-remote build
   pnpm --filter orchestrator build
   ```

4. **Build all workspace packages at once**

   ```bash
   pnpm build:all
   ```

5. **Preview production builds**

   ```bash
   pnpm preview
   pnpm --filter vue-remote preview
   pnpm --filter orchestrator preview
   ```

## Module Federation Contracts

The remotes expose a single `mount(container)` API:

- React remote exposes `react_remote/mount`
- Vue remote exposes `vue_remote/mount`

The orchestrator imports both and mounts them into its own layout.

## Build Output Optimization

The orchestrator production build uses explicit Rollup `manualChunks` splitting in `orchestrator/vite.config.ts`.

This keeps Angular/runtime dependencies split into separate cacheable chunks (for example `ng-core`, `ng-compiler`, `rxjs`, `zonejs`) and avoids one oversized host bundle.

## Orchestrator Remote URLs (Local vs Production)

The orchestrator reads remote entries from environment variables:

- `VITE_REACT_REMOTE_ENTRY`
- `VITE_VUE_REMOTE_ENTRY`

Local defaults are in [orchestrator/.env.development](orchestrator/.env.development).

For deployment, create `orchestrator/.env.production` based on [orchestrator/.env.production.example](orchestrator/.env.production.example) and set your Zephyr remote URLs.

Example production values:

```env
VITE_REACT_REMOTE_ENTRY=https://your-react-remote-domain/assets/remoteEntry.js
VITE_VUE_REMOTE_ENTRY=https://your-vue-remote-domain/assets/remoteEntry.js
```

Build host with production env:

```bash
pnpm build:host
```

## Zephyr Cloud Integration

The React remote keeps `vite-plugin-zephyr` available but opt-in.

- Local build/dev (default): no Zephyr upload behavior
- Zephyr build: `pnpm --dir react-remote build:zephyr`
- Zephyr build (Vue): `pnpm --dir vue-remote build:zephyr`

## Troubleshooting

### Dev stack exits after a React file change

Symptom example:

- `pnpm dev:react:build exited with code 1`
- followed by `--> Sending SIGTERM to other processes..`

Cause:

- `vite-plugin-inspect` can fail during incremental watch rebuilds in the React remote federation watch flow.

Current fix in this workspace:

- In `react-remote/vite.config.ts`, inspect is disabled when `MF_DEV=1`.

If this regression appears again:

1. Confirm `pnpm dev` is running with the existing scripts from root `package.json`.
2. Confirm React watch mode uses `MF_DEV=1 vite build --watch`.
3. Keep inspect disabled for MF watch mode (or remove it entirely for watch builds).
4. Restart from a clean state:

```bash
for p in 5173 5174 5175; do lsof -ti tcp:$p | xargs -r kill -9; done
pnpm dev
```

## ESLint Configuration

The project includes ESLint configuration with TypeScript support. For production applications, you can enhance the configuration with type-aware lint rules:

- Configure type-aware linting by updating `parserOptions`
- Use `plugin:@typescript-eslint/recommended-type-checked` for stricter rules
- Add `plugin:react/recommended` for React-specific linting

## Learn More

- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)
- [Vue Documentation](https://vuejs.org/)
- [TypeScript Documentation](https://www.typescriptlang.org/)
- [Vite Federation Plugin](https://github.com/originjs/vite-plugin-federation)
