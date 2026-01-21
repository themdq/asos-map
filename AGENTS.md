# Repository Guidelines

## Project Structure & Module Organization
- `src/pages/`: Astro routes and page entry points.
- `src/components/`: React/Astro UI components (map, controls, UI blocks).
- `src/layouts/`: Shared page layouts.
- `src/styles/`: Global styles and Tailwind-related CSS.
- `src/hooks/`, `src/lib/`, `src/utils/`, `src/types/`, `src/api/`: Supporting logic and shared types.
- `public/`: Static assets served as-is.
- `k8s/`, `Dockerfile`, `docker-compose.yml`: Deployment and container setup.

## Build, Test, and Development Commands
- `npm install`: Install dependencies.
- `npm run dev`: Start the local Astro dev server.
- `npm run build`: Build the production site into `dist/`.
- `npm run preview`: Serve the production build locally at `http://localhost:4321`.
- `npm run astro <cmd>`: Run Astro CLI commands (e.g., `npm run astro sync`).

## Coding Style & Naming Conventions
- Indentation: 2 spaces in TS/JS/TSX/CSS (follow existing files).
- Filenames: `PascalCase.tsx` for React components; `kebab-case.astro` for pages.
- Prefer functional React components and hooks stored under `src/hooks/`.
- Tailwind is available; keep global styles in `src/styles/global.css`.

## Testing Guidelines
- No test runner is configured in this repo yet.
- If you add tests, keep them close to the feature (e.g., `src/components/Foo.test.tsx`) and document the command in `package.json`.

## Commit & Pull Request Guidelines
- Commit messages in history are short, imperative, and lower-case (e.g., `fixed markers bug`). Follow that style unless agreed otherwise.
- PRs should include: a brief summary, screenshots for UI changes, and any config/env changes.

## Configuration & Secrets
- Mapbox requires `PUBLIC_MAPBOX_TOKEN` (see `.env`). Do not commit real secrets; use `.env.example` if you introduce new env vars.
