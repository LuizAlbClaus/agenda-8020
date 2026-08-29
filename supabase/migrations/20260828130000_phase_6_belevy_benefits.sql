-- Agenda 80/20 — Fase 6: benefício Belevy, handoff e activation tracking.
-- Preparada para aplicação via Supabase MCP; não aplicar remotamente nesta etapa.

alter table public.commerce_products
  add column if not exists belevy_benefit_days integer not null default 60
  check (belevy_benefit_days between 0 and 3650);

update public.commerce_products
set belevy_benefit_days = 60, updated_at = now()
where internal_product_code = 'agenda_8020' and belevy_benefit_days is distinct from 60;

create table if not exists public.benefit_entitlements (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  benefit_code text not null check (benefit_code = 'belevy_60_days'),
  source_purchase_id uuid not null unique references public.purchases(id) on delete restrict,
  status text not null default 'available' check (status in ('available','activating','active','expired','failed')),
  available_at timestamptz not null default now(),
  eligible_until timestamptz not null,
  activated_at timestamptz,
  expires_at timestamptz,
  external_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  check (eligible_until > available_at),
  check (expires_at is null or activated_at is not null and expires_at > activated_at),
  check ((status in ('available','activating') and activated_at is null and expires_at is null)
      or (status in ('active','expired') and activated_at is not null and expires_at is not null)
      or status = 'failed')
);

create index if not exists benefit_entitlements_user_status_idx
  on public.benefit_entitlements(user_id, status, eligible_until);
create index if not exists benefit_entitlements_source_purchase_idx
  on public.benefit_entitlements(source_purchase_id);

alter table public.benefit_entitlements enable row level security;
revoke all on table public.benefit_entitlements from public, anon, authenticated;
revoke all on table public.commerce_products from public, anon, authenticated;

drop trigger if exists benefit_entitlements_set_updated_at on public.benefit_entitlements;
create trigger benefit_entitlements_set_updated_at
before update on public.benefit_entitlements for each row execute function private.set_updated_at();

-- A grant is created only by the service-role webhook path. The trigger keeps
-- benefit creation idempotent and does not start the benefit clock.
create or replace function private.create_belevy_benefit_for_grant()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
declare v_days integer;
begin
  select cp.belevy_benefit_days into v_days
  from public.purchases p join public.commerce_products cp on cp.id = p.commerce_product_id
  where p.id = new.purchase_id and p.status = 'paid';
  if coalesce(v_days, 0) > 0 then
    insert into public.benefit_entitlements
      (user_id, benefit_code, source_purchase_id, status, available_at, eligible_until)
    values (new.user_id, 'belevy_60_days', new.purchase_id, 'available', now(), new.expires_at)
    on conflict (source_purchase_id) do nothing;
  end if;
  return new;
end;
$$;
revoke all on function private.create_belevy_benefit_for_grant() from public, anon, authenticated;
drop trigger if exists entitlement_grants_create_belevy_benefit on public.entitlement_grants;
create trigger entitlement_grants_create_belevy_benefit
after insert on public.entitlement_grants for each row execute function private.create_belevy_benefit_for_grant();

-- Backfill grants created by earlier migrations, preserving purchase-level
-- idempotency and deriving eligibility from the grant rather than now().
insert into public.benefit_entitlements
  (user_id, benefit_code, source_purchase_id, status, available_at, eligible_until)
select g.user_id, 'belevy_60_days', g.purchase_id, 'available', g.created_at, g.expires_at
from public.entitlement_grants g
join public.purchases p on p.id = g.purchase_id and p.status = 'paid'
join public.commerce_products cp on cp.id = p.commerce_product_id and cp.belevy_benefit_days > 0
on conflict (source_purchase_id) do nothing;

-- Refund/chargeback makes an unstarted benefit unusable. An already active
-- benefit is not silently revoked: its own expiry remains auditable.
create or replace function private.fail_belevy_benefit_on_grant_revocation()
returns trigger language plpgsql security definer
set search_path = pg_catalog, public
as $$
begin
  if new.status = 'revoked' and old.status is distinct from new.status then
    update public.benefit_entitlements
    set status = 'failed', updated_at = now()
    where source_purchase_id = new.purchase_id and status in ('available','activating');
  end if;
  return new;
end;
$$;
revoke all on function private.fail_belevy_benefit_on_grant_revocation() from public, anon, authenticated;
drop trigger if exists entitlement_grants_fail_belevy_benefit on public.entitlement_grants;
create trigger entitlement_grants_fail_belevy_benefit
after update of status on public.entitlement_grants for each row execute function private.fail_belevy_benefit_on_grant_revocation();

-- Admin commerce mapping includes benefit duration and retains the existing
-- audited mutation path.
create or replace function public.admin_upsert_commerce_mapping(p_id uuid, p_payload jsonb)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v uuid; b public.commerce_products%rowtype; r public.commerce_products%rowtype;
begin
  v := private.require_any_role(array['admin']::public.app_role[]);
  if p_id is null then
    insert into public.commerce_products(provider,provider_product_id,provider_offer_id,internal_product_code,access_days,belevy_benefit_days,active)
    values ('cakto',p_payload->>'provider_product_id',p_payload->>'provider_offer_id',p_payload->>'internal_product_code',
      (p_payload->>'access_days')::int,coalesce((p_payload->>'belevy_benefit_days')::int,60),coalesce((p_payload->>'active')::boolean,true)) returning * into r;
  else
    select * into b from public.commerce_products where id=p_id for update;
    update public.commerce_products set provider_product_id=coalesce(p_payload->>'provider_product_id',provider_product_id),
      provider_offer_id=coalesce(p_payload->>'provider_offer_id',provider_offer_id), internal_product_code=coalesce(p_payload->>'internal_product_code',internal_product_code),
      access_days=coalesce((p_payload->>'access_days')::int,access_days), belevy_benefit_days=coalesce((p_payload->>'belevy_benefit_days')::int,belevy_benefit_days),
      active=coalesce((p_payload->>'active')::boolean,active), updated_at=now() where id=p_id returning * into r;
  end if;
  perform private.write_admin_audit(case when p_id is null then 'create' else 'update' end,'commerce_mapping',r.id,case when p_id is null then null else to_jsonb(b) end,to_jsonb(r));
  return to_jsonb(r);
end; $$;
revoke all on function public.admin_upsert_commerce_mapping(uuid,jsonb) from public, anon;
grant execute on function public.admin_upsert_commerce_mapping(uuid,jsonb) to authenticated;

create or replace function public.admin_update_commerce_product(p_id uuid,p_input jsonb)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin return public.admin_upsert_commerce_mapping(p_id,jsonb_build_object('provider_product_id',p_input->>'product_id','provider_offer_id',p_input->>'offer_id','internal_product_code',coalesce(p_input->>'benefit','agenda_8020'),'access_days',p_input->>'access_days','belevy_benefit_days',coalesce(p_input->>'belevy_benefit_days',p_input->>'benefit_days'),'active',coalesce(p_input->'is_active','true'::jsonb))); end; $$;
revoke all on function public.admin_update_commerce_product(uuid,jsonb) from public, anon;
grant execute on function public.admin_update_commerce_product(uuid,jsonb) to authenticated;

-- Authenticated read: own benefit only, with a safe maturity handoff signal.
create or replace function public.get_belevy_benefit()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v_user uuid := auth.uid(); v public.benefit_entitlements%rowtype; v_handoff boolean;
begin
  if v_user is null then raise exception using errcode='28000',message='authentication_required'; end if;
  select * into v from public.benefit_entitlements where user_id=v_user order by created_at desc limit 1;
  if not found then return jsonb_build_object('benefit_id',null,'status',null,'duration_days',60,'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),'show_handoff',false); end if;
  select exists(select 1 from public.action_outcomes where user_id=v_user and status in ('interest','booking')) into v_handoff;
  return jsonb_build_object('benefit_id',v.id,'status',v.status,'duration_days',60,'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),'show_handoff',coalesce(v_handoff,false),'available_at',v.available_at,'eligible_until',v.eligible_until,'activated_at',v.activated_at,'expires_at',v.expires_at);
end; $$;
revoke all on function public.get_belevy_benefit() from public, anon;
grant execute on function public.get_belevy_benefit() to authenticated;

-- Service-role-only activation lifecycle; returns no email/name/behavior data.
-- Stable Edge Function contract (activation_id is the benefit id).
create or replace function public.belevy_activation_start(p_user_id uuid,p_benefit_id uuid,p_duration_days integer)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare b public.benefit_entitlements%rowtype;
begin
  -- SECURITY DEFINER changes current_user to the function owner. Use the
  -- PostgREST JWT role claim instead, which is service_role for Edge calls.
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  if p_duration_days <> 60 then raise exception using errcode='22023',message='invalid_benefit_duration'; end if;
  if not exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled) then raise exception using errcode='42501',message='belevy_activation_disabled'; end if;
  if not exists(select 1 from public.entitlements where user_id=p_user_id and product_code='agenda_8020' and status='active' and expires_at>now()) then raise exception using errcode='42501',message='entitlement_required'; end if;
  if p_benefit_id is null then
    select * into b from public.benefit_entitlements where user_id=p_user_id and status='available' and eligible_until>now() order by created_at for update limit 1;
  else
    select * into b from public.benefit_entitlements where id=p_benefit_id and user_id=p_user_id and status='available' and eligible_until>now() for update;
  end if;
  if not found then raise exception using errcode='42501',message='belevy_benefit_unavailable'; end if;
  update public.benefit_entitlements set status='activating',updated_at=now() where id=b.id returning * into b;
  return jsonb_build_object('activation_id',b.id,'benefit_id',b.id,'benefit_code',b.benefit_code,'duration_days',60,'status',b.status);
end; $$;
revoke all on function public.belevy_activation_start(uuid,uuid,integer) from public, anon, authenticated;
grant execute on function public.belevy_activation_start(uuid,uuid,integer) to service_role;

create or replace function public.belevy_activation_complete(p_activation_id uuid,p_external_reference text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare b public.benefit_entitlements%rowtype;
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  if p_external_reference is not null and length(trim(p_external_reference))>200 then raise exception using errcode='22023',message='invalid_external_reference'; end if;
  update public.benefit_entitlements set status='active',activated_at=coalesce(activated_at,now()),expires_at=coalesce(expires_at,now()+interval '60 days'),external_reference=coalesce(nullif(trim(p_external_reference),''),external_reference),updated_at=now()
  where id=p_activation_id and status='activating' returning * into b;
  if found then return jsonb_build_object('activation_id',b.id,'status','active','expires_at',b.expires_at); end if;
  select * into b from public.benefit_entitlements where id=p_activation_id and status='active';
  if found then return jsonb_build_object('activation_id',b.id,'status','active','expires_at',b.expires_at); end if;
  raise exception using errcode='42501',message='belevy_activation_failed';
exception when others then
  if sqlstate='42501' and sqlerrm='belevy_activation_failed' then raise; end if;
  raise exception using errcode='42501',message='belevy_activation_failed';
end; $$;
revoke all on function public.belevy_activation_complete(uuid,text) from public, anon, authenticated;
grant execute on function public.belevy_activation_complete(uuid,text) to service_role;

create or replace function public.belevy_activation_fail(p_activation_id uuid,p_error_code text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  update public.benefit_entitlements set status='failed',updated_at=now() where id=p_activation_id and status='activating';
  return jsonb_build_object('activation_id',p_activation_id,'status','failed');
exception when others then raise exception using errcode='42501',message='belevy_activation_failed';
end; $$;
revoke all on function public.belevy_activation_fail(uuid,text) from public, anon, authenticated;
grant execute on function public.belevy_activation_fail(uuid,text) to service_role;

create or replace function public.expire_belevy_benefits()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare n integer;
begin
  if coalesce(current_setting('request.jwt.claim.role', true),'') <> 'service_role' then raise exception using errcode='42501',message='service_role_required'; end if;
  update public.benefit_entitlements set status='expired',updated_at=now()
  where status='active' and expires_at <= now();
  get diagnostics n = row_count;
  update public.benefit_entitlements set status='failed',updated_at=now()
  where status in ('available','activating') and eligible_until <= now();
  return jsonb_build_object('expired',n);
exception when others then raise exception using errcode='42501',message='belevy_activation_failed';
end; $$;
revoke all on function public.expire_belevy_benefits() from public, anon, authenticated;
grant execute on function public.expire_belevy_benefits() to service_role;

-- Admin/support sees only minimum benefit metadata in the existing response.
create or replace function public.admin_list_users(p_email text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid;
begin
  v:=private.require_any_role(array['support','admin']::public.app_role[]);
  return coalesce((select jsonb_agg(jsonb_build_object('id',u.id,'user_id',u.id,'email',u.email,'name',p.name,'access_status',e.status,'expires_at',e.expires_at,'onboarding_status',case when bp.onboarding_completed_at is null then 'pending' else 'completed' end,'onboarding_completed_at',bp.onboarding_completed_at,'last_used_at',u.last_sign_in_at,'purchase_id',(select x.id from public.purchases x where x.user_id=u.id order by x.created_at desc limit 1),'benefits',(select jsonb_build_object('id',be.id,'status',be.status,'eligible_until',be.eligible_until,'activated_at',be.activated_at,'expires_at',be.expires_at) from public.benefit_entitlements be where be.user_id=u.id order by be.created_at desc limit 1))) from auth.users u left join public.profiles p on p.user_id=u.id left join public.entitlements e on e.user_id=u.id and e.product_code='agenda_8020' left join public.business_profiles bp on bp.user_id=u.id where p_email is null or lower(u.email)=lower(trim(p_email))),'[]'::jsonb);
end; $$;
revoke all on function public.admin_list_users(text) from public, anon;
grant execute on function public.admin_list_users(text) to authenticated;

create or replace function public.admin_list_commerce_products()
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare v uuid;
begin
  v:=private.require_any_role(array['admin']::public.app_role[]);
  return coalesce((select jsonb_agg(jsonb_build_object('id',c.id,'product_id',c.provider_product_id,'offer_id',c.provider_offer_id,'access_days',c.access_days,'belevy_benefit_days',c.belevy_benefit_days,'benefit',c.internal_product_code,'is_active',c.active) order by c.created_at) from public.commerce_products c),'[]'::jsonb);
end; $$;
revoke all on function public.admin_list_commerce_products() from public, anon;
grant execute on function public.admin_list_commerce_products() to authenticated;

comment on table public.benefit_entitlements is 'Fase 6: benefício Belevy por compra; available não inicia o prazo.';
