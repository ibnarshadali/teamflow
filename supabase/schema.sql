create extension if not exists "pgcrypto";

create type public.workspace_role as enum ('owner', 'member');
create type public.project_status as enum ('planning', 'active', 'paused', 'completed');
create type public.task_status as enum ('todo', 'in_progress', 'done');
create type public.task_priority as enum ('low', 'medium', 'high', 'urgent');
create type public.activity_type as enum (
  'workspace_created',
  'project_created',
  'project_updated',
  'task_created',
  'task_assigned',
  'task_status_changed',
  'comment_added',
  'task_completed'
);

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspaces (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  logo_url text,
  owner_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.workspace_members (
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  role public.workspace_role not null default 'member',
  created_at timestamptz not null default now(),
  primary key (workspace_id, user_id)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  name text not null,
  description text,
  status public.project_status not null default 'active',
  start_date date,
  target_date date,
  created_by uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (project_id, user_id)
);

create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  title text not null,
  description text,
  status public.task_status not null default 'todo',
  priority public.task_priority not null default 'medium',
  due_date date,
  assignee_id uuid references public.profiles(id) on delete set null,
  creator_id uuid not null references public.profiles(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.comments (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  task_id uuid not null references public.tasks(id) on delete cascade,
  author_id uuid not null references public.profiles(id),
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.activities (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  actor_id uuid not null references public.profiles(id),
  project_id uuid references public.projects(id) on delete cascade,
  task_id uuid references public.tasks(id) on delete cascade,
  type public.activity_type not null,
  message text not null,
  created_at timestamptz not null default now()
);

create index projects_workspace_updated_idx on public.projects(workspace_id, updated_at desc);
create index tasks_workspace_assignee_idx on public.tasks(workspace_id, assignee_id, status);
create index tasks_project_status_idx on public.tasks(project_id, status);
create index comments_task_created_idx on public.comments(task_id, created_at);
create index activities_workspace_created_idx on public.activities(workspace_id, created_at desc);

alter table public.profiles enable row level security;
alter table public.workspaces enable row level security;
alter table public.workspace_members enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.tasks enable row level security;
alter table public.comments enable row level security;
alter table public.activities enable row level security;

create or replace function public.is_workspace_member(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace and user_id = auth.uid()
  );
$$;

create or replace function public.is_workspace_owner(target_workspace uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.workspace_members
    where workspace_id = target_workspace and user_id = auth.uid() and role = 'owner'
  );
$$;

create policy "Users can read own profile" on public.profiles for select using (
  id = auth.uid() or exists (
    select 1 from public.workspace_members mine
    join public.workspace_members other_member on other_member.workspace_id = mine.workspace_id
    where mine.user_id = auth.uid() and other_member.user_id = profiles.id
  )
);
create policy "Users update own profile" on public.profiles for update using (id = auth.uid()) with check (id = auth.uid());
create policy "Users insert own profile" on public.profiles for insert with check (id = auth.uid());

create policy "Members read workspaces" on public.workspaces for select using (public.is_workspace_member(id));
create policy "Owners update workspaces" on public.workspaces for update using (public.is_workspace_owner(id)) with check (public.is_workspace_owner(id));
create policy "Authenticated users create owned workspace" on public.workspaces for insert with check (owner_id = auth.uid());

create policy "Members read workspace memberships" on public.workspace_members for select using (public.is_workspace_member(workspace_id));
create policy "Owners manage workspace memberships" on public.workspace_members for all using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));

create policy "Members read projects" on public.projects for select using (public.is_workspace_member(workspace_id));
create policy "Owners create projects" on public.projects for insert with check (public.is_workspace_owner(workspace_id));
create policy "Owners update projects" on public.projects for update using (public.is_workspace_owner(workspace_id)) with check (public.is_workspace_owner(workspace_id));
create policy "Owners delete projects" on public.projects for delete using (public.is_workspace_owner(workspace_id));

create policy "Members read project members" on public.project_members for select using (
  exists(select 1 from public.projects where projects.id = project_members.project_id and public.is_workspace_member(projects.workspace_id))
);
create policy "Owners manage project members" on public.project_members for all using (
  exists(select 1 from public.projects where projects.id = project_members.project_id and public.is_workspace_owner(projects.workspace_id))
) with check (
  exists(select 1 from public.projects where projects.id = project_members.project_id and public.is_workspace_owner(projects.workspace_id))
);

create policy "Members read tasks" on public.tasks for select using (public.is_workspace_member(workspace_id));
create policy "Members create tasks" on public.tasks for insert with check (public.is_workspace_member(workspace_id) and creator_id = auth.uid());
create policy "Members update tasks" on public.tasks for update using (public.is_workspace_member(workspace_id)) with check (public.is_workspace_member(workspace_id));
create policy "Owners delete tasks" on public.tasks for delete using (public.is_workspace_owner(workspace_id));

create policy "Members read comments" on public.comments for select using (public.is_workspace_member(workspace_id));
create policy "Members add comments" on public.comments for insert with check (public.is_workspace_member(workspace_id) and author_id = auth.uid());
create policy "Authors update comments" on public.comments for update using (author_id = auth.uid()) with check (author_id = auth.uid());
create policy "Authors delete comments" on public.comments for delete using (author_id = auth.uid());

create policy "Members read activities" on public.activities for select using (public.is_workspace_member(workspace_id));
create policy "Members create activities" on public.activities for insert with check (public.is_workspace_member(workspace_id) and actor_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, email)
  values (new.id, new.raw_user_meta_data->>'full_name', new.email)
  on conflict (id) do update set email = excluded.email;
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
