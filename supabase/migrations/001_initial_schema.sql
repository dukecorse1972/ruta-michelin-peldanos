create extension if not exists "pgcrypto";

create table if not exists public.restaurants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  stars int not null check (stars in (1, 2, 3)),
  city text,
  province text,
  autonomous_community text,
  address text,
  latitude numeric,
  longitude numeric,
  cuisine_type text,
  official_website text,
  tasting_menu_url text,
  image_url text,
  michelin_url text,
  is_active boolean default true,
  visited boolean default false,
  youtube_video_id text,
  youtube_url text,
  visited_source text,
  matched_confidence numeric,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.youtube_videos (
  id uuid primary key default gen_random_uuid(),
  youtube_video_id text unique not null,
  title text not null,
  description text,
  published_at timestamptz,
  thumbnail_url text,
  url text,
  is_michelin_series boolean default false,
  matched_restaurant_id uuid references public.restaurants(id) on delete set null,
  matched_confidence numeric,
  needs_review boolean default false,
  processed_at timestamptz,
  match_reason text,
  created_at timestamptz default now()
);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  role text default 'user' check (role in ('user', 'admin')),
  created_at timestamptz default now()
);

create table if not exists public.restaurant_aliases (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid not null references public.restaurants(id) on delete cascade,
  alias text not null,
  unique (restaurant_id, alias)
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists restaurants_set_updated_at on public.restaurants;
create trigger restaurants_set_updated_at
before update on public.restaurants
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, display_name, avatar_url)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.restaurants enable row level security;
alter table public.youtube_videos enable row level security;
alter table public.profiles enable row level security;
alter table public.restaurant_aliases enable row level security;

create policy "Public can read active restaurants"
on public.restaurants for select
using (is_active = true);

create policy "Admins can manage restaurants"
on public.restaurants for all
using (public.is_admin())
with check (public.is_admin());

create policy "Admins can read videos"
on public.youtube_videos for select
using (public.is_admin());

create policy "Admins can manage videos"
on public.youtube_videos for all
using (public.is_admin())
with check (public.is_admin());

create policy "Users can read own profile"
on public.profiles for select
using (auth.uid() = id or public.is_admin());

create policy "Users can update own basic profile"
on public.profiles for update
using (auth.uid() = id)
with check (auth.uid() = id and role = (select role from public.profiles where id = auth.uid()));

create policy "Admins can update profiles"
on public.profiles for all
using (public.is_admin())
with check (public.is_admin());

create policy "Public can read aliases"
on public.restaurant_aliases for select
using (true);

create policy "Admins can manage aliases"
on public.restaurant_aliases for all
using (public.is_admin())
with check (public.is_admin());
