create extension if not exists "pgcrypto";

create type public.user_role as enum ('tutor', 'seeker', 'admin');
create type public.tuition_status as enum ('draft', 'published', 'closed');
create type public.application_status as enum ('pending', 'accepted', 'rejected');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  role public.user_role not null default 'seeker',
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tutor_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  headline text not null,
  bio text,
  subjects text[] not null default '{}',
  classes text[] not null default '{}',
  location text not null,
  hourly_rate numeric(10, 2),
  is_verified boolean not null default false,
  is_public boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.tuition_posts (
  id uuid primary key default gen_random_uuid(),
  seeker_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text,
  subject text not null,
  class_level text not null,
  location text not null,
  schedule text,
  budget numeric(10, 2),
  status public.tuition_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  tuition_id uuid not null references public.tuition_posts(id) on delete cascade,
  tutor_id uuid not null references public.profiles(id) on delete cascade,
  status public.application_status not null default 'pending',
  message text,
  created_at timestamptz not null default now(),
  unique (tuition_id, tutor_id)
);

create index tutor_profiles_search_idx on public.tutor_profiles using gin (subjects, classes);
create index tutor_profiles_location_idx on public.tutor_profiles (location);
create index tuition_posts_search_idx on public.tuition_posts (subject, class_level, location);
create index tuition_posts_status_created_idx on public.tuition_posts (status, created_at desc);
create index applications_tutor_idx on public.applications (tutor_id, created_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.email),
    case
      when new.raw_user_meta_data ->> 'role' in ('tutor', 'seeker')
        then (new.raw_user_meta_data ->> 'role')::public.user_role
      else 'seeker'::public.user_role
    end
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.tutor_profiles enable row level security;
alter table public.tuition_posts enable row level security;
alter table public.applications enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);
create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Public tutors are viewable by everyone"
  on public.tutor_profiles for select using (is_public = true or auth.uid() = user_id);
create policy "Users can create their tutor profile"
  on public.tutor_profiles for insert with check (auth.uid() = user_id);
create policy "Users can update their tutor profile"
  on public.tutor_profiles for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Published tuition posts are viewable by everyone"
  on public.tuition_posts for select using (status = 'published' or auth.uid() = seeker_id);
create policy "Authenticated users can create tuition posts"
  on public.tuition_posts for insert with check (auth.uid() = seeker_id);
create policy "Owners can update their tuition posts"
  on public.tuition_posts for update using (auth.uid() = seeker_id) with check (auth.uid() = seeker_id);

create policy "Applicants and owners can view applications"
  on public.applications for select
  using (
    auth.uid() = tutor_id
    or exists (
      select 1 from public.tuition_posts
      where tuition_posts.id = applications.tuition_id
        and tuition_posts.seeker_id = auth.uid()
    )
  );
create policy "Tutors can apply to tuition posts"
  on public.applications for insert with check (auth.uid() = tutor_id);
create policy "Applicants can update their applications"
  on public.applications for update using (auth.uid() = tutor_id) with check (auth.uid() = tutor_id);
