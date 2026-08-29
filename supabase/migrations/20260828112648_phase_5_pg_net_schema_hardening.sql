-- Agenda 80/20 — Fase 5 incremental hardening: pg_net extension namespace.
-- pg_net is non-relocatable. Preserve all agenda-* cron commands, recreate
-- the extension in Supabase's extensions schema, then restore the schedules.
begin;

create temporary table _agenda_pg_net_jobs (
  jobname text primary key,
  schedule text not null,
  command text not null,
  active boolean not null
) on
commit
drop;

insert into
  _agenda_pg_net_jobs (jobname, schedule, command, active)
select
  jobname,
  schedule,
  command,
  active
from
  cron.job
where
  jobname like 'agenda-%';

do $$
declare
  v_job record;
begin
  for v_job in select jobid from cron.job where jobname like 'agenda-%' loop
    perform cron.unschedule(v_job.jobid);
  end loop;
end;
$$;

drop extension if exists pg_net;

create extension pg_net
with
  schema extensions;

-- The extension owns the net schema/functions while its extension object is
-- registered in extensions. Fail closed if the runtime does not provide the
-- documented net.http_post API after recreation.
do $$
begin
  if to_regprocedure('net.http_post(text,jsonb,jsonb,jsonb,integer)') is null then
    raise exception using errcode = '0A000', message = 'pg_net_http_post_missing_after_recreate';
  end if;
end;
$$;

-- Cron executes as the database owner. Keep the least required access after
-- recreation without restoring the old public extension placement.
grant usage on schema net to postgres;

grant
execute on function net.http_post (text, jsonb, jsonb, jsonb, integer) to postgres;

do $$
declare
  v_job record;
  v_jobid bigint;
begin
  for v_job in select jobname, schedule, command, active from _agenda_pg_net_jobs order by jobname loop
    select cron.schedule(v_job.jobname, v_job.schedule, v_job.command) into v_jobid;
    perform cron.alter_job(job_id := v_jobid, active := v_job.active);
  end loop;
end;
$$;

commit;
