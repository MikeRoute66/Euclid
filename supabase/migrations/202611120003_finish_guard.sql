create or replace function public.start_ranked_attempt(p_user uuid,p_proposition text,p_version text) returns jsonb
language plpgsql security definer set search_path=public as $$
declare a public.ranked_attempts;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user::text,0));
 update public.ranked_attempts set status='abandoned',validation_state=null where user_id=p_user and status='active';
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
 if a.validation_state is null or a.validated_lines<>jsonb_array_length(a.validation_state->'lines') or a.validated_lines=0 or a.submitted_at is distinct from p_received then raise exception 'Proof validation is incomplete'; end if;
 duration:=greatest(1,floor(extract(epoch from (p_received-a.started_at))*1000)::bigint);
 update public.ranked_attempts set status='finished',finished_at=p_received,validation_state=null where id=a.id;
 insert into public.best_times(user_id,proposition,course_version,elapsed_ms,attempt_id,achieved_at)
 values(p_user,a.proposition,a.course_version,duration,a.id,p_received)
 on conflict(user_id,proposition,course_version) do update set elapsed_ms=excluded.elapsed_ms,attempt_id=excluded.attempt_id,achieved_at=excluded.achieved_at
 where excluded.elapsed_ms<best_times.elapsed_ms;
 select elapsed_ms into best from public.best_times where user_id=p_user and proposition=a.proposition and course_version=a.course_version;
 return jsonb_build_object('elapsedMs',duration,'bestMs',best,'personalBest',duration=best);
end $$;
