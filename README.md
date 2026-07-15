# TeamFlow

TeamFlow is a professional project-management SaaS app for small software teams. Version 1 focuses on a calm daily dashboard, project tracking, Kanban-style task management, comments, workspace members, profile settings, and owner-only workspace settings.

## Features

- Supabase email/password authentication routes: `/login`, `/register`, `/forgot-password`
- Protected app routes: `/dashboard`, `/projects`, `/projects/new`, `/projects/[projectId]`, `/tasks`, `/team`, `/profile`, `/settings`
- Responsive application shell with collapsible sidebar, mobile nav, profile area, logout, and light/dark mode
- Project search, status filter, create/edit/delete flows, cards, and detail tabs
- Task create/edit/delete flows, status changes, priority, due date, assignee, details dialog, and comments
- Dashboard sections for my tasks, overdue tasks, due today, activity, active projects, deadlines, and quick actions
- Team and workspace settings views with owner/member role handling
- Demo data fallback when Supabase env vars are missing

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Tailwind CSS 4
- shadcn-style UI primitives
- Supabase Auth and Postgres
- Vercel-compatible configuration

## Local Setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`.

Without Supabase env vars, TeamFlow runs in demo mode so the interface can be reviewed without secrets.

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
```

Only the anon key is used in browser code. Do not commit service role keys.

## Supabase Setup

1. Create a Supabase project.
2. Copy `.env.example` to `.env.local`.
3. Add your project URL and anon key.
4. Run `supabase/schema.sql` in the Supabase SQL editor.
5. Register a user through `/register`.
6. Create a workspace/member row manually or adapt `supabase/seed.sql` for your user id.

## Database Migration

The schema lives in `supabase/schema.sql`. It creates profiles, workspaces, members, projects, project members, tasks, comments, activities, indexes, enums, RLS policies, and a trigger for profile creation.

## Commands

```bash
npm run dev
npm run lint
npm run typecheck
npm run build
npm run start
```

## Deployment

Deploy to Vercel and configure the Supabase environment variables in the Vercel project settings. Apply the database schema before testing protected routes in production.

## Screenshots

Screenshots should be added after visual QA across desktop, tablet, and mobile.

## Known Limitations

- In demo mode, CRUD changes are local to the browser session.
- Workspace creation onboarding is represented by an empty workspace state when no membership exists; a dedicated persistent onboarding action is still needed.
- Email invitations are documented as local-only unless Supabase email delivery is configured.
- Drag-and-drop is intentionally deferred; status changes use accessible controls.

## Roadmap

- Persistent server actions for every CRUD mutation
- Dedicated workspace onboarding flow after first registration
- Invitation acceptance flow
- Route-backed task details modal
- Automated component and data-access tests
