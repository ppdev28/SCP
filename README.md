# Server Control Center

Server Control Center (SCP) is a self-hosted server management panel inspired by Cockpit and Portainer, with a focus on a clean, modern and operationally useful interface.

## Project structure

- `frontend/` — React + TypeScript web application.
- `backend/` — Go API and server integrations (to be implemented).
- `docs/` — architecture and product documentation.

## Frontend

The frontend uses Vite, React, TypeScript, Tailwind CSS, React Router, TanStack Query, Lucide and Recharts.

```bash
cd frontend
npm install
npm run dev
```

## Development principles

- Keep the UI independent from infrastructure implementations.
- Use repository/service abstractions so mock data can later be replaced by the Go API.
- Keep the Dashboard as the visual reference for the application design system.
- Prefer small, reusable components over page-specific duplication.
