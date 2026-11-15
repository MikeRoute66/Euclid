-- Complete named-circle point-tool parity: explicit marking can register an
-- existing endpoint on a given circle, as it already can on a constructed one.
-- This adds a recorded input operation and invalidates no earlier proof/time.
begin;
update public.best_times
 set course_version='425a0109a59cda8e4cdd'
 where course_version='c6a0e080afa595bb5c6f';
commit;
