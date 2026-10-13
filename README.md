# TaskTrack Frontend

Public Next.js interface for QE190107 SE19B.NET Assignment 1.

## Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run dev
```

Set `NEXT_PUBLIC_API_URL` in `.env.local` to the backend base URL.

## Pages

- `/` — dashboard and active projects.
- `/departments` and `/departments/[id]` — department browsing.
- `/projects/[id]` and `/tasks/[id]` — public project and task details.
- `/search` — combined task filters.
- `/departments/manage`, `/projects/manage`, `/tasks/manage`, `/tags/manage` — public CRUD pages.

## Checks

```powershell
npm run lint
npm run build
```
