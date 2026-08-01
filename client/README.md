# IntellMeet — Client

React 19 + TypeScript frontend for IntellMeet, built with Vite, Tailwind CSS v4,
Zustand, React Router v6, and Framer Motion.

See the [root README](../README.md) for the full project overview, and
[DEPLOYMENT.md](../DEPLOYMENT.md) for deploying this app to Vercel.

## Setup

```bash
npm install
cp .env.example .env   # set VITE_API_URL / VITE_SOCKET_URL
npm run dev
```

Runs at `http://localhost:3000` by default (see `vite.config.ts`).

## Environment variables

| Variable | Description |
|---|---|
| `VITE_API_URL` | Base URL of the backend REST API, e.g. `http://localhost:5000/api` |
| `VITE_SOCKET_URL` | Base URL of the backend Socket.io server, e.g. `http://localhost:5000` |

These are read at **build time** — if deploying, set them in your hosting
provider's environment variables before triggering a build.

## Structure

```
src/
├── components/
│   ├── ui/          # Shared design-system primitives (Button, Card, Modal, Badge, Input, Skeleton, EmptyState)
│   ├── layout/       # AppShell, Navbar, Sidebar
│   ├── analytics/    # StatsCard
│   ├── meeting/      # MeetingCard
│   └── kanban/       # Board, Column, TaskCard, AddTaskModal
├── pages/            # Route-level pages (landing, auth, dashboard, meeting, tasks, analytics, profile)
├── api/              # Axios instance + auth API calls
├── store/            # Zustand auth store
├── router/           # AppRouter — all route definitions
└── config/           # Runtime constants (API_BASE_URL, SOCKET_URL, APP_NAME)
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc -b`) and build for production |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production build locally |
