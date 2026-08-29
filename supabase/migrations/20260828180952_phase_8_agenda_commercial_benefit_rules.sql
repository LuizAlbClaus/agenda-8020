-- Agenda 80/20 — Fase 8: commercial benefit rules.
-- Local migration only. Agenda access is a one-time purchase; benefit
-- duration is independent from access_days and is never inferred as a
-- subscription.

alter table public.commerce_products
  add column if not exists belevy_benefit_type text not null default 'promo'
    check (belevy_benefit_type in ('none','promo','paid_extension'));

-- The two Agenda offers are one-time access offers. Keep provider IDs and
-- offer IDs configured by the operator; this migration intentionally does
-- not invent or overwrite them.
update public.commerce_products
set belevy_benefit_days = 30,
    belevy_benefit_type = 'promo',
    updated_at = now()
where internal_product_code = 'agenda_8020'
  and belevy_benefit_type <> 'paid_extension';

-- Preserve already issued 60-day records. New records carry their actual
-- duration, allowing future paid extensions without changing Agenda access.
alter table public.benefit_entitlements
  add column if not exists duration_days integer;
alter table public.benefit_entitlements
  add column if not exists external_benefit_id text;
update public.benefit_entitlements
set duration_days = 60
where duration_days is null;
update public.benefit_entitlements
set external_benefit_id = id::text
where external_benefit_id is null;
update public.benefit_entitlements
set external_benefit_id = id::text
where external_benefit_id in ('agenda_30_day_trial','agenda_60_day_extension');
create unique index if not exists benefit_entitlements_external_benefit_id_uidx
  on public.benefit_entitlements(external_benefit_id)
  where external_benefit_id is not null;
alter table public.benefit_entitlements
  alter column duration_days set default 30,
  alter column duration_days set not null;
alter table public.benefit_entitlements
  drop constraint if exists benefit_entitlements_benefit_code_check;
alter table public.benefit_entitlements
  add constraint benefit_entitlements_benefit_code_check
  check (benefit_code in ('belevy_60_days','belevy_promo','belevy_paid_extension'));
alter table public.benefit_entitlements
  add constraint benefit_entitlements_duration_days_check
  check (duration_days between 1 and 3650);

create or replace function private.create_belevy_benefit_for_grant()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_days integer; v_type text; v_code text;
begin
  select cp.belevy_benefit_days, cp.belevy_benefit_type
    into v_days, v_type
  from public.purchases p
  join public.commerce_products cp on cp.id = p.commerce_product_id
  where p.id = new.purchase_id and p.status = 'paid';
  if coalesce(v_days, 0) > 0 and coalesce(v_type, 'none') <> 'none' then
    v_code := case when v_type = 'paid_extension' then 'belevy_paid_extension' else 'belevy_promo' end;
    insert into public.benefit_entitlements
      (user_id, benefit_code, source_purchase_id, duration_days, status, available_at, eligible_until)
    values (new.user_id, v_code, new.purchase_id, v_days, 'available', now(), new.expires_at)
    on conflict (source_purchase_id) do nothing;
    update public.benefit_entitlements set external_benefit_id=id::text
      where source_purchase_id=new.purchase_id and external_benefit_id is null;
  end if;
  return new;
end;
$$;
revoke all on function private.create_belevy_benefit_for_grant() from public, anon, authenticated;

-- Keep one auditable available record for a later external policy decision,
-- but do not stack free promotional benefits. The Agenda purchase creates a
-- single deferred 30-day promo record; cross-product alumni grants remain
-- outside this repository and must adjudicate against this record.
create or replace function public.get_belevy_benefit()
returns jsonb language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_user uuid := auth.uid(); v public.benefit_entitlements%rowtype; v_handoff boolean;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  select * into v from public.benefit_entitlements
   where user_id=v_user and status in ('available','activating','active')
   order by (benefit_code='belevy_paid_extension') desc, duration_days desc, created_at desc limit 1;
  if not found then
    return jsonb_build_object('benefit_id',null,'status',null,'duration_days',0,
      'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),
      'show_handoff',false);
  end if;
  select exists(select 1 from public.action_outcomes where user_id=v_user and status in ('interest','booking')) into v_handoff;
  return jsonb_build_object('benefit_id',v.id,'status',v.status,'duration_days',v.duration_days,
    'benefit_code',v.benefit_code,'external_benefit_id',v.external_benefit_id,'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),
    'show_handoff',coalesce(v_handoff,false),'available_at',v.available_at,'eligible_until',v.eligible_until,
    'activated_at',v.activated_at,'expires_at',v.expires_at);
end;
$$;
revoke all on function public.get_belevy_benefit() from public, anon;
grant execute on function public.get_belevy_benefit() to authenticated;

create or replace function public.belevy_activation_start(p_user_id uuid,p_benefit_id uuid,p_duration_days integer)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare b public.benefit_entitlements%rowtype;
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  if not exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled) then raise exception using errcode='42501',message='belevy_activation_disabled'; end if;
  if not exists(select 1 from public.entitlements where user_id=p_user_id and product_code='agenda_8020' and status='active' and expires_at>now()) then raise exception using errcode='42501',message='entitlement_required'; end if;
  select * into b from public.benefit_entitlements where id=p_benefit_id and user_id=p_user_id and status='available' and eligible_until>now() for update;
  if not found then raise exception using errcode='42501',message='belevy_benefit_unavailable'; end if;
  if p_duration_days is not null and p_duration_days is distinct from b.duration_days then raise exception using errcode='22023',message='invalid_benefit_duration'; end if;
  update public.benefit_entitlements set status='activating',updated_at=now() where id=b.id returning * into b;
  return jsonb_build_object('activation_id',b.id,'benefit_id',b.id,'benefit_code',b.benefit_code,'external_benefit_id',b.external_benefit_id,'duration_days',b.duration_days,'status',b.status);
end; $$;
revoke all on function public.belevy_activation_start(uuid,uuid,integer) from public,anon,authenticated;
grant execute on function public.belevy_activation_start(uuid,uuid,integer) to service_role;

create or replace function public.belevy_activation_complete(p_activation_id uuid,p_external_reference text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare b public.benefit_entitlements%rowtype;
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  update public.benefit_entitlements set status='active',activated_at=coalesce(activated_at,now()),expires_at=coalesce(expires_at,now()+make_interval(days=>duration_days)),external_reference=coalesce(nullif(trim(p_external_reference),''),external_reference),updated_at=now() where id=p_activation_id and status='activating' returning * into b;
  if found then return jsonb_build_object('activation_id',b.id,'status','active','duration_days',b.duration_days,'expires_at',b.expires_at); end if;
  select * into b from public.benefit_entitlements where id=p_activation_id and status='active';
  if found then return jsonb_build_object('activation_id',b.id,'status','active','duration_days',b.duration_days,'expires_at',b.expires_at); end if;
  raise exception using errcode='42501',message='belevy_activation_failed';
end; $$;
revoke all on function public.belevy_activation_complete(uuid,text) from public,anon,authenticated;
grant execute on function public.belevy_activation_complete(uuid,text) to service_role;

comment on column public.commerce_products.access_days is 'Agenda access duration in days; one-time purchase entitlement.';
comment on column public.commerce_products.belevy_benefit_days is 'Deferred Belevy benefit duration; independent of Agenda access and not a subscription.';
comment on column public.commerce_products.belevy_benefit_type is 'promo or paid_extension; external policy prevents free promotional stacking.';
comment on column public.benefit_entitlements.duration_days is 'Actual duration granted to Belevy on activation; historical records are preserved.';
