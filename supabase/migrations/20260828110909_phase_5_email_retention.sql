-- Agenda 80/20 — Fase 5: email, retenção e agendamento seguro.
-- Migration local-first; não aplica alterações a projeto remoto.
create extension if not exists pg_cron;

create extension if not exists pg_net;

create extension if not exists supabase_vault
with
  schema vault;

alter table public.email_outbox
alter column user_id
drop not null,
add column if not exists provider_message_id text;

alter table public.email_outbox
drop constraint if exists email_outbox_template_key_check;

alter table public.email_outbox
add constraint email_outbox_template_key_check check (
  template_key in (
    'access_granted',
    'auth_magic_link',
    'daily_plan_reminder',
    'outcome_pending',
    'weekly_review',
    'access_expiring_30d',
    'access_expiring_7d',
    'access_expiring_1d',
    'access_revoked',
    'belevy_available'
  )
);

alter table public.email_outbox
drop constraint if exists email_outbox_status_check;

alter table public.email_outbox
add constraint email_outbox_status_check check (
  status in (
    'pending',
    'processing',
    'sent',
    'failed',
    'suppressed'
  )
);

create index if not exists email_outbox_provider_message_id_idx on public.email_outbox (provider_message_id)
where
  provider_message_id is not null;

create index if not exists email_outbox_behavioral_recipient_idx on public.email_outbox (lower(recipient_email), template_key, status);

create table if not exists public.notification_preferences (
  user_id uuid primary key references auth.users (id) on delete cascade,
  daily_email_enabled boolean not null default false,
  daily_period text not null default 'morning' check (
    daily_period in ('morning', 'afternoon', 'evening')
  ),
  weekly_email_enabled boolean not null default false,
  outcome_reminder_enabled boolean not null default false,
  marketing_email_enabled boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.email_delivery_events (
  id uuid primary key default gen_random_uuid(),
  provider_event_id text not null unique,
  provider_message_id text not null,
  event_type text not null check (
    event_type in ('delivered', 'bounced', 'complained')
  ),
  occurred_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists email_delivery_events_message_idx on public.email_delivery_events (provider_message_id, event_type, occurred_at desc);

create table if not exists public.weekly_summaries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  week_start date not null,
  actions_completed integer not null default 0 check (actions_completed >= 0),
  interest_count integer not null default 0 check (interest_count >= 0),
  booking_count integer not null default 0 check (booking_count >= 0),
  confidence_level public.confidence_level not null default 'learning',
  top_category text,
  summary_text text not null,
  generated_at timestamptz not null default now(),
  unique (user_id, week_start)
);

create index if not exists weekly_summaries_user_week_idx on public.weekly_summaries (user_id, week_start desc);

drop trigger if exists notification_preferences_set_updated_at on public.notification_preferences;

create trigger notification_preferences_set_updated_at
before update on public.notification_preferences for each row
execute function private.set_updated_at ();

alter table public.notification_preferences enable row level security;

alter table public.email_delivery_events enable row level security;

alter table public.weekly_summaries enable row level security;

revoke all on table public.notification_preferences,
public.email_delivery_events,
public.weekly_summaries
from
  public,
  anon,
  authenticated;

grant
select
  on table public.notification_preferences to authenticated;

grant
select
  on table public.weekly_summaries to authenticated;

drop policy if exists notification_preferences_owner_select on public.notification_preferences;

create policy notification_preferences_owner_select on public.notification_preferences for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

drop policy if exists notification_preferences_owner_insert on public.notification_preferences;

create policy notification_preferences_owner_insert on public.notification_preferences for insert to authenticated
with
  check (
    (
      select
        auth.uid ()
    ) = user_id
  );

drop policy if exists notification_preferences_owner_update on public.notification_preferences;

create policy notification_preferences_owner_update on public.notification_preferences
for update
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  )
with
  check (
    (
      select
        auth.uid ()
    ) = user_id
  );

drop policy if exists email_delivery_events_deny_authenticated on public.email_delivery_events;

create policy email_delivery_events_deny_authenticated on public.email_delivery_events for all to authenticated using (false)
with
  check (false);

drop policy if exists weekly_summaries_owner_select on public.weekly_summaries;

create policy weekly_summaries_owner_select on public.weekly_summaries for
select
  to authenticated using (
    (
      select
        auth.uid ()
    ) = user_id
  );

-- Bounce/complaint suppression is address-wide, but only behavioral templates
-- use it. Essential access, security, expiry and revocation emails bypass it.
create or replace function private.email_address_is_behaviorally_suppressed (p_email text) returns boolean language sql stable security definer
set
  search_path = pg_catalog,
  public as $$
  select exists(select 1 from public.email_delivery_events de join public.email_outbox eo on eo.provider_message_id=de.provider_message_id
    where lower(eo.recipient_email)=lower(trim(p_email)) and de.event_type in ('bounced','complained'));
$$;

revoke all on function private.email_address_is_behaviorally_suppressed (text)
from
  public,
  anon,
  authenticated;

create or replace function private.enqueue_email (
  p_idempotency_key text,
  p_template_key text,
  p_recipient_email text,
  p_recipient_name text default null,
  p_user_id uuid default null,
  p_payload jsonb default '{}'::jsonb,
  p_available_at timestamptz default null
) returns uuid language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare v_id uuid; v_status text:='pending';
begin
  if nullif(trim(p_idempotency_key),'') is null then raise exception using errcode='22023',message='email_idempotency_key_required'; end if;
  if nullif(trim(p_recipient_email),'') is null then raise exception using errcode='22023',message='email_recipient_required'; end if;
  if p_template_key in ('daily_plan_reminder','outcome_pending','weekly_review','belevy_available') and private.email_address_is_behaviorally_suppressed(p_recipient_email) then v_status:='suppressed'; end if;
  insert into public.email_outbox(idempotency_key,template_key,recipient_email,recipient_name,user_id,payload,status,available_at)
  values(trim(p_idempotency_key),p_template_key,lower(trim(p_recipient_email)),nullif(trim(p_recipient_name),''),p_user_id,
    case when jsonb_typeof(coalesce(p_payload,'{}'::jsonb))='object' then coalesce(p_payload,'{}'::jsonb) else '{}'::jsonb end,v_status,coalesce(p_available_at,now()))
  on conflict(idempotency_key) do nothing returning id into v_id;
  return v_id;
end; $$;

revoke all on function private.enqueue_email (text, text, text, text, uuid, jsonb, timestamptz)
from
  public,
  anon,
  authenticated;

create or replace function public.get_notification_preferences () returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare v_user uuid:=auth.uid(); v public.notification_preferences%rowtype;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if not public.can_access_agenda(v_user) then raise exception using errcode='42501',message='entitlement_required'; end if;
  select * into v from public.notification_preferences where user_id=v_user;
  return jsonb_build_object('user_id',v_user,'daily_email_enabled',coalesce(v.daily_email_enabled,false),'daily_period',coalesce(v.daily_period,'morning'),
    'weekly_email_enabled',coalesce(v.weekly_email_enabled,false),'outcome_reminder_enabled',coalesce(v.outcome_reminder_enabled,false),
    'marketing_email_enabled',coalesce(v.marketing_email_enabled,false),'updated_at',v.updated_at);
end; $$;

create or replace function public.save_notification_preferences (
  p_daily_email_enabled boolean,
  p_daily_period text,
  p_weekly_email_enabled boolean,
  p_outcome_reminder_enabled boolean,
  p_marketing_email_enabled boolean
) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare v_user uuid:=auth.uid(); v public.notification_preferences%rowtype;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  if not public.can_access_agenda(v_user) then raise exception using errcode='42501',message='entitlement_required'; end if;
  if p_daily_period is null or p_daily_period not in ('morning','afternoon','evening') then raise exception using errcode='22023',message='invalid_daily_period'; end if;
  insert into public.notification_preferences(user_id,daily_email_enabled,daily_period,weekly_email_enabled,outcome_reminder_enabled,marketing_email_enabled)
  values(v_user,coalesce(p_daily_email_enabled,false),p_daily_period,coalesce(p_weekly_email_enabled,false),coalesce(p_outcome_reminder_enabled,false),coalesce(p_marketing_email_enabled,false))
  on conflict(user_id) do update set daily_email_enabled=excluded.daily_email_enabled,daily_period=excluded.daily_period,
    weekly_email_enabled=excluded.weekly_email_enabled,outcome_reminder_enabled=excluded.outcome_reminder_enabled,
    marketing_email_enabled=excluded.marketing_email_enabled,updated_at=now() returning * into v;
  return jsonb_build_object('user_id',v_user,'daily_email_enabled',v.daily_email_enabled,'daily_period',v.daily_period,
    'weekly_email_enabled',v.weekly_email_enabled,'outcome_reminder_enabled',v.outcome_reminder_enabled,'marketing_email_enabled',v.marketing_email_enabled,'updated_at',v.updated_at);
end; $$;

revoke all on function public.get_notification_preferences ()
from
  public,
  anon;

revoke all on function public.save_notification_preferences (boolean, text, boolean, boolean, boolean)
from
  public,
  anon;

grant
execute on function public.get_notification_preferences () to authenticated;

grant
execute on function public.save_notification_preferences (boolean, text, boolean, boolean, boolean) to authenticated;

create or replace function public.mark_email_outbox_sent (
  p_id uuid,
  p_processing_token uuid,
  p_provider_message_id text
) returns boolean language sql security definer
set
  search_path = pg_catalog,
  public as $$
  with updated as (update public.email_outbox set status='sent',sent_at=now(),last_error=null,provider_message_id=nullif(trim(p_provider_message_id),''),processing_token=null,updated_at=now()
    where id=p_id and status='processing' and processing_token=p_processing_token returning 1) select exists(select 1 from updated);
$$;

revoke all on function public.mark_email_outbox_sent (uuid, uuid, text)
from
  public,
  anon,
  authenticated;

grant
execute on function public.mark_email_outbox_sent (uuid, uuid, text) to service_role;

-- Fase 1 claim is retained, with the Fase 5 retry ceiling made explicit.
create or replace function public.claim_email_outbox (p_limit integer default 10) returns table (
  id uuid,
  idempotency_key text,
  template_key text,
  recipient_email text,
  recipient_name text,
  user_id uuid,
  payload jsonb,
  attempts integer,
  processing_token uuid
) language sql security definer
set
  search_path = pg_catalog,
  public as $$
  with candidates as (
    select eo.id from public.email_outbox eo
    where ((eo.status in ('pending','failed') and eo.attempts<5 and eo.available_at<=now())
      or (eo.status='processing' and eo.updated_at<now()-interval '15 minutes'))
    order by eo.created_at for update skip locked limit greatest(1,least(coalesce(p_limit,10),50))
  ), claimed as (
    update public.email_outbox eo set status='processing',attempts=eo.attempts+1,processing_token=gen_random_uuid(),updated_at=now()
    from candidates c where eo.id=c.id returning eo.*
  ) select c.id,c.idempotency_key,c.template_key,c.recipient_email,c.recipient_name,c.user_id,c.payload,c.attempts,c.processing_token from claimed c;
$$;

revoke all on function public.claim_email_outbox (integer)
from
  public,
  anon,
  authenticated;

grant
execute on function public.claim_email_outbox (integer) to service_role;

create or replace function public.record_email_delivery_event (
  p_provider_event_id text,
  p_provider_message_id text,
  p_event_type text,
  p_occurred_at timestamptz default null
) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare v_id uuid; v_inserted boolean; v_suppressed integer:=0;
begin
  if nullif(trim(p_provider_event_id),'') is null or nullif(trim(p_provider_message_id),'') is null then raise exception using errcode='22023',message='provider_event_identity_required'; end if;
  if p_event_type not in ('delivered','bounced','complained') then raise exception using errcode='22023',message='invalid_delivery_event_type'; end if;
  insert into public.email_delivery_events(provider_event_id,provider_message_id,event_type,occurred_at) values(trim(p_provider_event_id),trim(p_provider_message_id),p_event_type,coalesce(p_occurred_at,now()))
    on conflict(provider_event_id) do nothing returning id into v_id;
  v_inserted:=v_id is not null;
  if v_inserted and p_event_type in ('bounced','complained') then
    update public.email_outbox set status='suppressed',last_error='recipient_delivery_suppressed',processing_token=null,updated_at=now()
      where provider_message_id=trim(p_provider_message_id) and template_key in ('daily_plan_reminder','outcome_pending','weekly_review','belevy_available') and status in ('pending','processing','failed');
    get diagnostics v_suppressed=row_count;
  end if;
  return jsonb_build_object('status',case when v_inserted then 'recorded' else 'duplicate' end,'suppressed',v_suppressed);
end; $$;

revoke all on function public.record_email_delivery_event (text, text, text, timestamptz)
from
  public,
  anon,
  authenticated;

grant
execute on function public.record_email_delivery_event (text, text, text, timestamptz) to service_role;

create or replace function public.enqueue_daily_plan_reminders (p_period text, p_limit integer default 500) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare r record; v_id uuid; v_count integer:=0;
begin
  if p_period not in ('morning','afternoon','evening') then raise exception using errcode='22023',message='invalid_daily_period'; end if;
  for r in select u.id user_id,u.email,p.name,(now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date local_date
    from auth.users u join public.profiles p on p.user_id=u.id join public.business_profiles bp on bp.user_id=u.id and bp.onboarding_completed_at is not null
    join public.notification_preferences np on np.user_id=u.id and np.daily_email_enabled and np.daily_period=p_period
    join public.entitlements e on e.user_id=u.id and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()
    where u.email is not null order by u.id limit greatest(1,least(coalesce(p_limit,500),5000)) loop
      v_id:=private.enqueue_email('daily_plan_reminder:'||r.user_id||':'||r.local_date,'daily_plan_reminder',r.email,r.name,r.user_id,jsonb_build_object('local_date',r.local_date,'period',p_period));
      if v_id is not null then v_count:=v_count+1; end if;
  end loop; return jsonb_build_object('period',p_period,'enqueued',v_count);
end; $$;

create or replace function public.enqueue_outcome_reminders (p_limit integer default 500) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare r record; v_id uuid; v_count integer:=0;
begin
  for r in select ao.id outcome_id,ao.user_id,u.email,p.name from public.action_outcomes ao join auth.users u on u.id=ao.user_id and u.email is not null
    join public.profiles p on p.user_id=ao.user_id join public.notification_preferences np on np.user_id=ao.user_id and np.outcome_reminder_enabled
    join public.entitlements e on e.user_id=ao.user_id and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()
    where ao.status='pending' and ao.maturation_at<=now() and (ao.last_prompted_at is null or ao.last_prompted_at<now()-interval '24 hours') order by ao.maturation_at limit greatest(1,least(coalesce(p_limit,500),5000)) loop
      v_id:=private.enqueue_email('outcome_pending:'||r.outcome_id||':'||current_date,'outcome_pending',r.email,r.name,r.user_id,jsonb_build_object('outcome_id',r.outcome_id));
      update public.action_outcomes set last_prompted_at=now(),updated_at=now() where id=r.outcome_id and status='pending' and (last_prompted_at is null or last_prompted_at<now()-interval '24 hours');
      if v_id is not null then v_count:=v_count+1; end if;
  end loop; return jsonb_build_object('enqueued',v_count);
end; $$;

create or replace function public.enqueue_weekly_summaries (p_limit integer default 500) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare r record; v_id uuid; v_summary_id uuid; v_count integer:=0; v_actions integer; v_interest integer; v_booking integer; v_top_category text; v_confidence public.confidence_level; v_summary_text text;
begin
  for r in select u.id user_id,u.email,p.name,p.timezone,date_trunc('week',now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date week_start
    from auth.users u join public.profiles p on p.user_id=u.id join public.business_profiles bp on bp.user_id=u.id and bp.onboarding_completed_at is not null
    join public.notification_preferences np on np.user_id=u.id and np.weekly_email_enabled join public.entitlements e on e.user_id=u.id and e.product_code='agenda_8020' and e.status='active' and e.expires_at>now()
    where u.email is not null order by u.id limit greatest(1,least(coalesce(p_limit,500),5000)) loop
      select count(*)::integer into v_actions from public.action_executions ae where ae.user_id=r.user_id
        and (ae.completed_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date>=r.week_start
        and (ae.completed_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date<r.week_start+7;
      select coalesce(sum(ao.interest_count),0)::integer,coalesce(sum(ao.booking_count),0)::integer into v_interest,v_booking
        from public.action_outcomes ao where ao.user_id=r.user_id and ao.finalized_at is not null
        and (ao.finalized_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date>=r.week_start
        and (ao.finalized_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date<r.week_start+7;
      select ap.category into v_top_category from public.action_outcomes ao join public.action_executions ae on ae.id=ao.execution_id join public.action_versions av on av.id=ae.action_version_id join public.action_protocols ap on ap.id=av.protocol_id
        where ao.user_id=r.user_id and ao.finalized_at is not null and (ao.finalized_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date>=r.week_start and (ao.finalized_at at time zone coalesce(nullif(r.timezone,''),'America/Sao_Paulo'))::date<r.week_start+7
        group by ap.category order by sum(ao.booking_count) desc,sum(ao.interest_count) desc,ap.category limit 1;
      v_confidence:=case when v_booking>=2 then 'strong_signal'::public.confidence_level when v_interest+v_booking>0 then 'signal'::public.confidence_level else 'learning'::public.confidence_level end;
      v_summary_text:=case when v_booking>0 then 'Você registrou '||v_booking||' horário(s) marcado(s) nesta semana. Continue observando o que traz retorno.' when v_interest>0 then 'Você registrou sinais de interesse nesta semana. Vale continuar testando ações possíveis para o seu momento.' when v_actions>0 then 'Você concluiu '||v_actions||' ação(ões) nesta semana. O próximo passo é observar quais trazem retorno.' else 'Esta semana pode ser um bom momento para retomar uma ação simples do seu plano.' end;
      v_summary_id:=null;
      insert into public.weekly_summaries(user_id,week_start,actions_completed,interest_count,booking_count,confidence_level,top_category,summary_text)
        values(r.user_id,r.week_start,v_actions,v_interest,v_booking,v_confidence,v_top_category,v_summary_text) on conflict(user_id,week_start) do nothing returning id into v_summary_id;
      if v_summary_id is null then select ws.id into v_summary_id from public.weekly_summaries ws where ws.user_id=r.user_id and ws.week_start=r.week_start; end if;
      v_id:=private.enqueue_email('weekly_review:'||r.user_id||':'||r.week_start,'weekly_review',r.email,r.name,r.user_id,jsonb_build_object('summary_id',v_summary_id,'week_start',r.week_start));
      if v_id is not null then v_count:=v_count+1; end if;
  end loop; return jsonb_build_object('enqueued',v_count);
end; $$;

create or replace function public.enqueue_weekly_review (p_limit integer default 500) returns jsonb language sql security definer
set
  search_path = pg_catalog,
  public as $$ select public.enqueue_weekly_summaries(p_limit); $$;

create or replace function public.enqueue_expiry_notices (p_limit integer default 500) returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare r record; v_id uuid; v_count integer:=0;
begin
  for r in select u.id user_id,u.email,p.name,e.expires_at,
    case when (e.expires_at at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date=(now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date+30 then 30
    when (e.expires_at at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date=(now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date+7 then 7 else 1 end days_left
    from public.entitlements e join auth.users u on u.id=e.user_id and u.email is not null join public.profiles p on p.user_id=e.user_id
    where e.product_code='agenda_8020' and e.status='active' and e.expires_at>now() and (e.expires_at at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date in
      ((now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date+30,(now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date+7,(now() at time zone coalesce(nullif(p.timezone,''),'America/Sao_Paulo'))::date+1)
    order by e.expires_at limit greatest(1,least(coalesce(p_limit,500),5000)) loop
      v_id:=private.enqueue_email('access_expiring_'||r.days_left||'d:'||r.user_id||':'||r.expires_at::date,
        case r.days_left when 30 then 'access_expiring_30d' when 7 then 'access_expiring_7d' else 'access_expiring_1d' end,r.email,r.name,r.user_id,jsonb_build_object('expires_at',r.expires_at,'days_left',r.days_left));
      if v_id is not null then v_count:=v_count+1; end if;
  end loop; return jsonb_build_object('enqueued',v_count);
end; $$;

create or replace function public.expire_entitlements () returns jsonb language plpgsql security definer
set
  search_path = pg_catalog,
  public as $$
declare v_count integer; begin update public.entitlements set status='expired',updated_at=now() where status='active' and expires_at<=now(); get diagnostics v_count=row_count; return jsonb_build_object('expired',v_count); end; $$;

revoke all on function public.enqueue_daily_plan_reminders (text, integer),
public.enqueue_outcome_reminders (integer),
public.enqueue_weekly_summaries (integer),
public.enqueue_weekly_review (integer),
public.enqueue_expiry_notices (integer),
public.expire_entitlements ()
from
  public,
  anon,
  authenticated;

grant
execute on function public.enqueue_daily_plan_reminders (text, integer),
public.enqueue_outcome_reminders (integer),
public.enqueue_weekly_summaries (integer),
public.enqueue_weekly_review (integer),
public.enqueue_expiry_notices (integer),
public.expire_entitlements () to service_role;

do $$ begin
  if not exists(select 1 from vault.secrets where name='agenda_cron_secret') then perform vault.create_secret(encode(gen_random_bytes(32),'hex'),'agenda_cron_secret','Agenda 80/20 scheduled Edge Function authentication'); end if;
  if not exists(select 1 from vault.secrets where name='agenda_project_url') then perform vault.create_secret('https://sepgbhztpktstzsgxvqk.supabase.co','agenda_project_url','Agenda 80/20 project URL for scheduled Edge Functions'); end if;
end; $$;

create or replace function public.validate_scheduled_request (p_secret text) returns boolean language sql stable security definer
set
  search_path = pg_catalog,
  public,
  vault as $$
  select p_secret is not null and p_secret<>'' and exists(select 1 from vault.decrypted_secrets where name='agenda_cron_secret' and decrypted_secret=p_secret);
$$;

revoke all on function public.validate_scheduled_request (text)
from
  public,
  anon,
  authenticated;

grant
execute on function public.validate_scheduled_request (text) to service_role;

-- UTC schedules correspond to Brazil (UTC-3). Every request gets its secret
-- from Vault at execution time; no secret is embedded in SQL or Edge code.
do $$
declare j record;
begin
  for j in select jobid from cron.job where jobname in ('agenda-email-worker','agenda-outcome-reminders','agenda-expire-entitlements','agenda-expiry-notices','agenda-daily-reminders-morning','agenda-daily-reminders-afternoon','agenda-daily-reminders-evening','agenda-weekly-summaries') loop perform cron.unschedule(j.jobid); end loop;
  perform cron.schedule('agenda-email-worker','*/5 * * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/send-email-worker',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"limit":25}'::jsonb)$c$);
  perform cron.schedule('agenda-outcome-reminders','0 * * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-outcome-reminders',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"outcome_pending"}'::jsonb)$c$);
  perform cron.schedule('agenda-expire-entitlements','0 3 * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-checkins',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"expire_entitlements"}'::jsonb)$c$);
  perform cron.schedule('agenda-expiry-notices','15 12 * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-checkins',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"expiry_notices"}'::jsonb)$c$);
  perform cron.schedule('agenda-daily-reminders-morning','0 12 * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-checkins',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"daily_reminders","period":"morning"}'::jsonb)$c$);
  perform cron.schedule('agenda-daily-reminders-afternoon','0 17 * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-checkins',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"daily_reminders","period":"afternoon"}'::jsonb)$c$);
  perform cron.schedule('agenda-daily-reminders-evening','0 22 * * *',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/process-checkins',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"daily_reminders","period":"evening"}'::jsonb)$c$);
  perform cron.schedule('agenda-weekly-summaries','0 12 * * 1',$c$select net.http_post(url:=(select decrypted_secret from vault.decrypted_secrets where name='agenda_project_url')||'/functions/v1/generate-weekly-summaries',headers:=jsonb_build_object('Content-Type','application/json','x-agenda-cron-secret',(select decrypted_secret from vault.decrypted_secrets where name='agenda_cron_secret')),body:='{"job":"weekly_review"}'::jsonb)$c$);
end; $$;
