-- Keep the database's accepted stages aligned with the reviewed public course.
begin;
alter table public.ranked_attempts drop constraint if exists ranked_attempts_proposition_check;
alter table public.ranked_attempts add constraint ranked_attempts_proposition_check
 check (proposition ~ '^(1\.([1-9]|[1-3][0-9]|4[0-8])|2\.([1-9]|1[0-4])|3\.[1-7])$');
commit;
