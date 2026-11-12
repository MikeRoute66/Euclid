alter table public.ranked_attempts add column if not exists validation_state jsonb;
alter table public.ranked_attempts add column if not exists validated_lines integer not null default 0;
alter table public.ranked_attempts add column if not exists submitted_at timestamptz;

create or replace function public.begin_ranked_validation(p_user uuid,p_attempt uuid,p_state jsonb,p_received timestamptz) returns jsonb
language plpgsql security definer set search_path=public as $$
declare a public.ranked_attempts;
begin
 select * into a from public.ranked_attempts where id=p_attempt and user_id=p_user for update;
 if not found or a.status<>'active' or a.started_at<clock_timestamp()-interval '6 hours' then raise exception 'Inactive attempt'; end if;
 if a.validation_state is null then
  if p_received<=a.started_at or p_received>clock_timestamp()+interval '5 seconds' then raise exception 'Invalid submission time'; end if;
  update public.ranked_attempts set validation_state=p_state,submitted_at=p_received where id=a.id returning * into a;
 end if;
 return jsonb_build_object('state',a.validation_state,'cursor',a.validated_lines,'received',a.submitted_at);
end $$;

create or replace function public.advance_ranked_validation(p_user uuid,p_attempt uuid,p_from integer,p_to integer) returns integer
language plpgsql security definer set search_path=public as $$
declare a public.ranked_attempts;
begin
 select * into a from public.ranked_attempts where id=p_attempt and user_id=p_user for update;
 if not found or a.status<>'active' then raise exception 'Inactive attempt'; end if;
 if a.validated_lines=p_from then
  if p_to<=p_from or p_to>jsonb_array_length(a.validation_state->'lines') then raise exception 'Invalid checkpoint'; end if;
  update public.ranked_attempts set validated_lines=p_to where id=a.id;
  return p_to;
 end if;
 return a.validated_lines;
end $$;
revoke all on function public.begin_ranked_validation(uuid,uuid,jsonb,timestamptz),public.advance_ranked_validation(uuid,uuid,integer,integer) from public,anon,authenticated;
grant execute on function public.begin_ranked_validation(uuid,uuid,jsonb,timestamptz),public.advance_ranked_validation(uuid,uuid,integer,integer) to service_role;
