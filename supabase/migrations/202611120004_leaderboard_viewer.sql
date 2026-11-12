-- One public-safe snapshot, without PostgREST's row limit cutting off later boards.
create or replace function public.ranked_leaderboards(p_version text) returns jsonb
language sql stable security definer set search_path=public as $$
 with ranked as (
  select b.proposition,p.username,b.elapsed_ms,
   row_number() over(partition by b.proposition order by b.elapsed_ms,b.achieved_at,b.user_id) as rank
  from public.best_times b join public.player_profiles p on p.user_id=b.user_id
  where b.course_version=p_version
 ), boards as (
  select proposition,jsonb_agg(jsonb_build_object('rank',rank,'username',username,'elapsedMs',elapsed_ms) order by rank) as rows
  from ranked where rank<=100 group by proposition
 )
 select coalesce(jsonb_agg(jsonb_build_object('proposition',proposition,'rows',rows)
  order by split_part(proposition,'.',1)::integer,split_part(proposition,'.',2)::integer),'[]'::jsonb) from boards;
$$;
revoke all on function public.ranked_leaderboards(text) from public,anon,authenticated;
grant execute on function public.ranked_leaderboards(text) to service_role;
