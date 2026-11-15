-- The Book III extension preserves every previously accepted Book I/II rule.
-- All 62 old routes and the Book I negative/provenance regressions pass the new
-- verifier. Retain already verified best times across this compatible release.
-- No player, time, achievement timestamp, or signed attempt record is altered.
begin;
update public.best_times
 set course_version='c6a0e080afa595bb5c6f'
 where course_version='c3e34a3317fa7c6ecc4a'
 and proposition ~ '^[12]\.';
commit;
