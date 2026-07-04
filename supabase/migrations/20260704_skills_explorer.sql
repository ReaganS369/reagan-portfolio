/** @format */

-- ============================================================
-- Skills Explorer — admin-driven hierarchy for the 3D Skills
-- Explorer on /stats. Run this once in the Supabase SQL editor.
--
-- Design notes:
--   * `skill_nodes` is a self-referencing tree (parent_id) with no
--     depth limit — Level 0/1/2/... are just how deep a row sits
--     under root (parent_id is null), so Level 3+ needs zero schema
--     changes, only more rows.
--   * `rating` (0-5) is the only proficiency input. The relative
--     surface area shown in the 3D explorer is ALWAYS derived at
--     read time from sibling ratings — no percentage/weight column
--     exists to hand-edit, so the two can never drift apart.
--   * `skill_tools` are attached resources, not nodes — they never
--     appear in the hierarchy or as their own wedge, only in a
--     skill's hover panel.
--   * Extra JSON-ish future fields (project refs, links, media,
--     certificates, related skills, timeline) can live in `metadata`
--     (jsonb) without another migration.
-- ============================================================

create table if not exists public.skill_nodes (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.skill_nodes(id) on delete cascade,
  level int not null default 0,
  name text not null,
  description text,
  icon text,
  color text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  sort_order int not null default 0,
  is_active boolean not null default true,
  notes text,
  -- future-ready extension point: project refs, portfolio links,
  -- images, videos, evidence, certificates, related skills, timeline
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists skill_nodes_parent_id_idx on public.skill_nodes(parent_id);
create index if not exists skill_nodes_level_idx on public.skill_nodes(level);

create table if not exists public.skill_tools (
  id uuid primary key default gen_random_uuid(),
  skill_node_id uuid not null references public.skill_nodes(id) on delete cascade,
  name text not null,
  icon text,
  rating numeric(2,1) check (rating is null or (rating >= 0 and rating <= 5)),
  notes text,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists skill_tools_skill_node_id_idx on public.skill_tools(skill_node_id);

-- keep updated_at current on every edit
create or replace function public.set_skill_nodes_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists skill_nodes_set_updated_at on public.skill_nodes;
create trigger skill_nodes_set_updated_at
  before update on public.skill_nodes
  for each row execute function public.set_skill_nodes_updated_at();

-- RLS: matches this project's existing CMS tables — the anon key is
-- used directly from the admin UI (route access is gated by the
-- admin login cookie, not table-level auth), so these mirror that
-- same permissive-public policy shape. Tighten if your other CMS
-- tables use a stricter policy.
alter table public.skill_nodes enable row level security;
alter table public.skill_tools enable row level security;

drop policy if exists "skill_nodes_public_all" on public.skill_nodes;
create policy "skill_nodes_public_all" on public.skill_nodes
  for all using (true) with check (true);

drop policy if exists "skill_tools_public_all" on public.skill_tools;
create policy "skill_tools_public_all" on public.skill_tools
  for all using (true) with check (true);
