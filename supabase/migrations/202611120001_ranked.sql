-- All writes go through the authenticated Edge Function. Browser roles have no writes.
create table if not exists public.player_profiles (
 user_id uuid primary key references auth.users(id) on delete cascade,
 username text not null check(username ~ '^[A-Za-z0-9_]{3,24}$'),
 created_at timestamptz not null default now()
);
create unique index if not exists player_username_unique on public.player_profiles(lower(username));
create table if not exists public.ranked_attempts (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references public.player_profiles(user_id) on delete cascade,
 proposition text not null check(proposition ~ '^[12]\.[0-9]{1,2}$'),
 course_version text not null,
 started_at timestamptz not null default clock_timestamp(),
 finished_at timestamptz,
 status text not null default 'active' check(status in ('active','finished','abandoned'))
);
create unique index if not exists one_active_attempt on public.ranked_attempts(user_id) where status='active';
create table if not exists public.best_times (
 user_id uuid not null references public.player_profiles(user_id) on delete cascade,
 proposition text not null,
 course_version text not null,
 elapsed_ms bigint not null check(elapsed_ms>0),
 achieved_at timestamptz not null default now(),
 attempt_id uuid not null unique references public.ranked_attempts(id),
 primary key(user_id,proposition,course_version)
);
create index if not exists ranked_board_order on public.best_times(proposition,course_version,elapsed_ms,achieved_at);
create table if not exists public.online_rate_limits (
 bucket text primary key, hits integer not null, expires_at timestamptz not null
);
alter table public.player_profiles enable row level security;
alter table public.ranked_attempts enable row level security;
alter table public.best_times enable row level security;
alter table public.online_rate_limits enable row level security;
revoke all on public.player_profiles,public.ranked_attempts,public.best_times,public.online_rate_limits from anon,authenticated;
grant all on public.player_profiles,public.ranked_attempts,public.best_times,public.online_rate_limits to service_role;

create or replace function public.create_player_profile() returns trigger
language plpgsql security definer set search_path=public as $$
begin
 insert into public.player_profiles(user_id,username) values(new.id,new.raw_user_meta_data->>'username');
 return new;
end $$;
drop trigger if exists create_player_profile on auth.users;
create trigger create_player_profile after insert on auth.users for each row execute function public.create_player_profile();

create or replace function public.online_rate_gate(p_bucket text,p_limit integer,p_seconds integer) returns boolean
language plpgsql security definer set search_path=public as $$
declare n integer;
begin
 insert into public.online_rate_limits values(p_bucket,1,clock_timestamp()+make_interval(secs=>p_seconds))
 on conflict(bucket) do update set
 hits=case when online_rate_limits.expires_at<clock_timestamp() then 1 else online_rate_limits.hits+1 end,
 expires_at=case when online_rate_limits.expires_at<clock_timestamp() then clock_timestamp()+make_interval(secs=>p_seconds) else online_rate_limits.expires_at end
 returning hits into n;
 delete from public.online_rate_limits where expires_at<clock_timestamp()-interval '1 day';
 return n<=p_limit;
end $$;

create or replace function public.start_ranked_attempt(p_user uuid,p_proposition text,p_version text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare a public.ranked_attempts;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 update public.ranked_attempts set status='abandoned' where user_id=p_user and status='active';
 insert into public.ranked_attempts(user_id,proposition,course_version) values(p_user,p_proposition,p_version) returning * into a;
 return jsonb_build_object('id',a.id,'startedAt',a.started_at);
end $$;

create or replace function public.finish_ranked_attempt(p_user uuid,p_attempt uuid,p_received timestamptz) returns jsonb
language plpgsql security definer set search_path=public as $$
declare a public.ranked_attempts; duration bigint; best bigint;
begin
 select * into a from public.ranked_attempts where id=p_attempt and user_id=p_user for update;
 if not found then raise exception 'Attempt not found'; end if;
 if a.status='finished' then
  select elapsed_ms into best from public.best_times where user_id=p_user and proposition=a.proposition and course_version=a.course_version;
  return jsonb_build_object('elapsedMs',floor(extract(epoch from (a.finished_at-a.started_at))*1000)::bigint,'bestMs',best);
 end if;
 if a.status<>'active' or a.started_at<clock_timestamp()-interval '6 hours' then raise exception 'Attempt expired or superseded'; end if;
 if p_received<=a.started_at or p_received>clock_timestamp()+interval '5 seconds' then raise exception 'Invalid finish time'; end if;
 duration:=greatest(1,floor(extract(epoch from (p_received-a.started_at))*1000)::bigint);
 update public.ranked_attempts set status='finished',finished_at=p_received where id=a.id;
 insert into public.best_times(user_id,proposition,course_version,elapsed_ms,attempt_id,achieved_at)
 values(p_user,a.proposition,a.course_version,duration,a.id,p_received)
 on conflict(user_id,proposition,course_version) do update set elapsed_ms=excluded.elapsed_ms,attempt_id=excluded.attempt_id,achieved_at=excluded.achieved_at
 where excluded.elapsed_ms<best_times.elapsed_ms;
 select elapsed_ms into best from public.best_times where user_id=p_user and proposition=a.proposition and course_version=a.course_version;
 return jsonb_build_object('elapsedMs',duration,'bestMs',best,'personalBest',duration=best);
end $$;
revoke all on function public.create_player_profile(),public.online_rate_gate(text,integer,integer),public.start_ranked_attempt(uuid,text,text),public.finish_ranked_attempt(uuid,uuid,timestamptz) from public,anon,authenticated;
grant execute on function public.online_rate_gate(text,integer,integer),public.start_ranked_attempt(uuid,text,text),public.finish_ranked_attempt(uuid,uuid,timestamptz) to service_role;
