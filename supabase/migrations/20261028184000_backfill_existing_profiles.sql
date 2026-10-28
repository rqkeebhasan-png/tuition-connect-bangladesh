insert into public.profiles (id, full_name, role)
select
  users.id,
  coalesce(users.raw_user_meta_data ->> 'full_name', users.email),
  case
    when users.raw_user_meta_data ->> 'role' in ('tutor', 'seeker')
      then (users.raw_user_meta_data ->> 'role')::public.user_role
    else 'seeker'::public.user_role
  end
from auth.users as users
where not exists (
  select 1
  from public.profiles
  where profiles.id = users.id
);
