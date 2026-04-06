# Teranga Cockpit

Frontend cockpit for tracking product execution, deadlines, go-to-market, viability, and build capacity.

## Current scope

- Next.js frontend workspace for project steering
- KPI view for execution, time to first clients, and acquisition cadence
- Strategy, planner, sprint, and records surfaces ready to connect to a real backend

## Goal

The next step is to replace local demo storage with a scalable backend connected to:

- Laravel 12 for the application backend
- PostgreSQL for persistent product and business data
- Google Calendar for time-blocking and delivery capacity
- Cloudinary for asset and file management
- Auth, workspace-based access, and co-founder collaboration with encapsulated project data

## Local run

```bash
npm install
npm run dev
```

## Quality checks

```bash
npm run typecheck
npm run build
```

## Backend planning

See `backend requireement.md` for the backend prompt, architecture, packages, and integration requirements.
