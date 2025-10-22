-- Enable pgcrypto for UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
--  Utility trigger for auto-updating updated_at timestamps
-- ============================================================
create or replace function handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- ============================================================
-- 1) profiles
-- ============================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique not null,
  first_name text,
  last_name text,
  role text not null check (role in ('owner','client','admin')) default 'client',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger on_profiles_updated
before update on public.profiles
for each row execute procedure handle_updated_at();

-- ============================================================
-- 2) projects
-- ============================================================
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  code text unique,
  description text,
  status text check (status in ('planning','active','on_hold','completed')) default 'active',
  start_date date,
  end_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger on_projects_updated
before update on public.projects
for each row execute procedure handle_updated_at();

-- ============================================================
-- 3) project_members
-- ============================================================
create table if not exists public.project_members (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  profile_id uuid references public.profiles(id) on delete cascade,
  role text check (role in ('owner','client','pm','viewer')) default 'viewer',
  created_at timestamptz default now()
);

-- ============================================================
-- 4) milestones
-- ============================================================
create table if not exists public.milestones (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  category text not null,
  title text not null,
  description text,
  status text not null check (status in ('Completed','On Track','At Risk')) default 'On Track',
  status_color text,
  target_date date,
  completed_date date,
  day_label text,
  is_completed boolean default false,
  sort_index int,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger on_milestones_updated
before update on public.milestones
for each row execute procedure handle_updated_at();

-- ============================================================
-- 5) documents
-- ============================================================
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  category text,
  description text,
  file_url text not null,
  version int default 1,
  status text check (status in ('draft','review','approved','archived')) default 'draft',
  uploaded_by uuid references public.profiles(id),
  uploaded_at timestamptz default now()
);

-- ============================================================
-- 6) document_tags
-- ============================================================
create table if not exists public.document_tags (
  id uuid primary key default gen_random_uuid(),
  document_id uuid references public.documents(id) on delete cascade,
  tag text not null
);

-- ============================================================
-- 7) daily_reports
-- ============================================================
create table if not exists public.daily_reports (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  report_date date not null,
  weather jsonb,
  summary text,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now()
);

-- ============================================================
-- 8) issues
-- ============================================================
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  title text not null,
  description text,
  severity text check (severity in ('low','medium','high')) default 'medium',
  status text check (status in ('open','in_progress','resolved','closed')) default 'open',
  due_date date,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create trigger on_issues_updated
before update on public.issues
for each row execute procedure handle_updated_at();

-- ============================================================
-- 9) metrics_snapshots
-- ============================================================
create table if not exists public.metrics_snapshots (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references public.projects(id) on delete cascade,
  snapshot_date date not null,
  data jsonb not null,
  created_at timestamptz default now()
);

-- ============================================================
-- Enable Row-Level Security (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.projects enable row level security;
alter table public.project_members enable row level security;
alter table public.milestones enable row level security;
alter table public.documents enable row level security;
alter table public.document_tags enable row level security;
alter table public.daily_reports enable row level security;
alter table public.issues enable row level security;
alter table public.metrics_snapshots enable row level security;

-- ============================================================
-- Minimal Policies (you can refine later in Supabase GUI)
-- ============================================================
-- Profiles: each user can read/update their own
create policy "Profiles: self read" on public.profiles
for select using (id = auth.uid());

create policy "Profiles: self update" on public.profiles
for update using (id = auth.uid());

-- Projects: members can view
create policy "Projects: member can view" on public.projects
for select using (
  exists (
    select 1 from public.project_members m
    where m.project_id = id and m.profile_id = auth.uid()
  )
);

-- Project_members: member can view own projects
create policy "Project Members: member view" on public.project_members
for select using (
  profile_id = auth.uid()
);

-- ============================================================
-- Minimal seed data
-- ============================================================

-- Insert a demo profile (replace UUID with actual user id from auth.users)
insert into public.profiles (id, email, first_name, last_name, role)
values ('00000000-0000-0000-0000-000000000000', 'demo@supabase.io', 'Demo', 'Owner', 'owner')
on conflict do nothing;

-- Insert demo project
insert into public.projects (name, code, description, created_by)
values ('Demo Project', 'PRJ-001', 'Initial demo project', '00000000-0000-0000-0000-000000000000')
on conflict do nothing;

-- Link demo profile to project
insert into public.project_members (project_id, profile_id, role)
select p.id, '00000000-0000-0000-0000-000000000000', 'owner' from public.projects p
on conflict do nothing;

-- Insert example milestones
insert into public.milestones (project_id, category, title, status, day_label, sort_index)
select p.id, 'Foundation', 'Ground Work', 'On Track', 'Day 1', 1 from public.projects p
on conflict do nothing;

insert into public.milestones (project_id, category, title, status, day_label, sort_index)
select p.id, 'Structure', 'Pillars Setup', 'At Risk', 'Day 12', 2 from public.projects p
on conflict do nothing;

-- Insert example document + tag
insert into public.documents (project_id, title, category, file_url, uploaded_by)
select p.id, 'Site Plan', 'Drawing', 'documents/site_plan.pdf', '00000000-0000-0000-0000-000000000000' from public.projects p
on conflict do nothing;

insert into public.document_tags (document_id, tag)
select d.id, 'architecture' from public.documents d
on conflict do nothing;
