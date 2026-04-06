create extension if not exists "pgcrypto";

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  stage text not null,
  start_date date not null default current_date,
  current_section_key text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sections (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  key text not null,
  title text not null,
  objective text not null,
  notes_markdown text not null default '',
  time_spent_hours integer not null default 0,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.sprints (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  goal text not null,
  duration_label text not null,
  review text not null default '',
  retrospective text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  sprint_id uuid not null references public.sprints(id) on delete cascade,
  title text not null,
  status text not null check (status in ('To Do', 'In Progress', 'Done')),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  person text not null,
  context text not null,
  pain_points jsonb not null default '[]'::jsonb,
  signals jsonb not null default '[]'::jsonb,
  trust_level text not null check (trust_level in ('Low', 'Medium', 'High')),
  felt text not null default '',
  learned text not null default '',
  changed text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.insights (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete cascade,
  conversation_id uuid references public.conversations(id) on delete set null,
  content text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.files (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  section_id uuid references public.sections(id) on delete set null,
  conversation_id uuid references public.conversations(id) on delete set null,
  task_id uuid references public.tasks(id) on delete set null,
  name text not null,
  public_id text not null,
  file_url text not null,
  file_type text not null,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.metrics (
  id uuid primary key default gen_random_uuid(),
  project_id uuid not null references public.projects(id) on delete cascade,
  label text not null,
  value text not null,
  note text not null default '',
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

alter table public.projects enable row level security;
alter table public.sections enable row level security;
alter table public.sprints enable row level security;
alter table public.tasks enable row level security;
alter table public.conversations enable row level security;
alter table public.insights enable row level security;
alter table public.files enable row level security;
alter table public.metrics enable row level security;

create policy "users manage own projects"
on public.projects
for all
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "users manage own sections"
on public.sections
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.sections.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.sections.project_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own sprints"
on public.sprints
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.sprints.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.sprints.project_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own tasks"
on public.tasks
for all
using (
  exists (
    select 1
    from public.sprints
    join public.projects on public.projects.id = public.sprints.project_id
    where public.sprints.id = public.tasks.sprint_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.sprints
    join public.projects on public.projects.id = public.sprints.project_id
    where public.sprints.id = public.tasks.sprint_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own conversations"
on public.conversations
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.conversations.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.conversations.project_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own insights"
on public.insights
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.insights.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.insights.project_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own files"
on public.files
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.files.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.files.project_id
    and public.projects.user_id = auth.uid()
  )
);

create policy "users manage own metrics"
on public.metrics
for all
using (
  exists (
    select 1 from public.projects
    where public.projects.id = public.metrics.project_id
    and public.projects.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.projects
    where public.projects.id = public.metrics.project_id
    and public.projects.user_id = auth.uid()
  )
);
