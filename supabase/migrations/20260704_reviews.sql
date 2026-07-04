-- ============================================================
-- Reviews — public feedback submitted from the portfolio and managed
-- through the admin dashboard.
-- ============================================================

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  display_name text not null,
  avatar text not null,
  rating int not null check (rating >= 1 and rating <= 5),
  public_review text not null,
  private_suggestion text,
  recommendation text not null default 'maybe',
  relationship text,
  status text not null default 'pending',
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists reviews_status_idx on public.reviews(status);
create index if not exists reviews_featured_idx on public.reviews(featured);
create index if not exists reviews_created_at_idx on public.reviews(created_at);

create or replace function public.set_reviews_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists reviews_set_updated_at on public.reviews;
create trigger reviews_set_updated_at
  before update on public.reviews
  for each row execute function public.set_reviews_updated_at();

alter table public.reviews enable row level security;

drop policy if exists "reviews_public_all" on public.reviews;
create policy "reviews_public_all" on public.reviews
  for all using (true) with check (true);

-- Broadcast row changes so the admin dashboard (and the public site) stay in
-- sync live. Guarded so re-running the migration is a no-op.
do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'reviews'
  ) then
    alter publication supabase_realtime add table public.reviews;
  end if;
end
$$;
