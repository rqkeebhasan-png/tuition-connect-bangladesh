-- Preserve account roles and restrict marketplace writes to the appropriate users.

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

create or replace function public.prevent_profile_role_change()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Profile roles can only be changed by a trusted administrator';
  end if;
  return new;
end;
$$;

drop trigger if exists prevent_profile_role_change on public.profiles;
create trigger prevent_profile_role_change
  before update of role on public.profiles
  for each row execute procedure public.prevent_profile_role_change();

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "Users can create their tutor profile" on public.tutor_profiles;
create policy "Tutors can create their tutor profile"
  on public.tutor_profiles for insert
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'tutor'::public.user_role
    )
  );

drop policy if exists "Users can update their tutor profile" on public.tutor_profiles;
create policy "Tutors can update their tutor profile"
  on public.tutor_profiles for update
  using (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'tutor'::public.user_role
    )
  )
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = auth.uid()
        and profiles.role = 'tutor'::public.user_role
    )
  );

create or replace function public.restrict_application_updates()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  is_tuition_owner boolean;
begin
  select exists (
    select 1
    from public.tuition_posts
    where tuition_posts.id = old.tuition_id
      and tuition_posts.seeker_id = auth.uid()
  )
  into is_tuition_owner;

  if auth.uid() = old.tutor_id then
    if new.tuition_id is distinct from old.tuition_id
      or new.tutor_id is distinct from old.tutor_id
      or new.status is distinct from old.status then
      raise exception 'Applicants can only update their application message';
    end if;
  elsif is_tuition_owner then
    if new.tuition_id is distinct from old.tuition_id
      or new.tutor_id is distinct from old.tutor_id
      or new.message is distinct from old.message then
      raise exception 'Tuition owners can only update application status';
    end if;
  else
    raise exception 'You are not allowed to update this application';
  end if;

  return new;
end;
$$;

drop trigger if exists restrict_application_updates on public.applications;
create trigger restrict_application_updates
  before update on public.applications
  for each row execute procedure public.restrict_application_updates();

drop policy if exists "Applicants can update their applications" on public.applications;
create policy "Applicants can update application messages"
  on public.applications for update
  using (auth.uid() = tutor_id)
  with check (auth.uid() = tutor_id);

create policy "Tuition owners can update application status"
  on public.applications for update
  using (
    exists (
      select 1
      from public.tuition_posts
      where tuition_posts.id = applications.tuition_id
        and tuition_posts.seeker_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1
      from public.tuition_posts
      where tuition_posts.id = applications.tuition_id
        and tuition_posts.seeker_id = auth.uid()
    )
  );
