# TeamFlow Architecture

TeamFlow uses the Next.js App Router with route groups for authentication and authenticated application pages.

- `src/app/(auth)` contains public auth routes.
- `src/app/(dashboard)` contains protected product routes.
- `src/components/ui` contains shadcn-style primitives backed by Tailwind design tokens.
- `src/components/layout` contains reusable navigation and application chrome.
- `src/features` contains feature-level UI and actions.
- `src/lib/supabase` contains Supabase browser/server client setup.
- `src/lib/data.ts` maps Supabase rows into app domain types and falls back to demo data when env vars are not configured.

Server components handle route entry and initial data loading. Client components are used for interactive forms, dialogs, navigation collapse, local CRUD review flows, comments, filters, and status changes.

The current V1 UI is intentionally dependency-light: no Redux, no global store, and no drag-and-drop library. Kanban status changes use accessible select controls.
