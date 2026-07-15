# Database Schema

Apply `supabase/schema.sql` in the Supabase SQL editor or through the Supabase CLI.

Core tables:

- `profiles`: public profile data linked to `auth.users`.
- `workspaces`: one workspace per V1 owner.
- `workspace_members`: owner/member role membership.
- `projects`: workspace projects.
- `project_members`: project-level membership.
- `tasks`: project tasks with status, priority, due date, assignee, and creator.
- `comments`: task comments.
- `activities`: meaningful workspace/project/task events.

RLS is enabled on all public tables. Policies allow workspace members to read workspace data, members to create/update tasks and comments, authors to edit/delete their own comments, and owners to manage workspace/project destructive actions.

`supabase/seed.sql` contains a safe commented seed template. Replace `YOUR_AUTH_USER_ID` with a real user id before running it.
