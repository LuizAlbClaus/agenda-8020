-- Cakto order bump: R$19,90 adds 30 paid Belevy days to the included
-- 30-day promo, so the customer receives 60 days in total. It does not grant
-- or extend Agenda access and must not trigger a second access email.
alter table public.commerce_products
  add column if not exists sends_access_email boolean not null default true;

insert into public.commerce_products
  (provider, provider_product_id, provider_offer_id, internal_product_code,
   access_days, belevy_benefit_days, belevy_benefit_type, sends_access_email, active)
values
  ('cakto', 'e412eb02-ccf5-47e9-9fe1-ce846a074140', '32pc6hy', 'belevy_paid_extension',
   365, 30, 'paid_extension', false, true)
on conflict (provider, provider_product_id, provider_offer_id) do update
set internal_product_code = excluded.internal_product_code,
    access_days = excluded.access_days,
    belevy_benefit_days = excluded.belevy_benefit_days,
    belevy_benefit_type = excluded.belevy_benefit_type,
    sends_access_email = excluded.sends_access_email,
    active = excluded.active,
    updated_at = now();

-- The commerce path intentionally records a separate entitlement grant so the
-- existing immutable purchase ledger and benefit trigger remain idempotent.
-- Its product code is never accepted by can_access_agenda().
create or replace function private.suppress_non_access_product_email()
returns trigger language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_purchase_id uuid;
begin
  if new.template_key <> 'access_granted' or new.idempotency_key !~ '^access_granted:' then return new; end if;
  begin v_purchase_id := substring(new.idempotency_key from '^access_granted:([0-9a-f-]{36})$')::uuid;
  exception when others then return new; end;
  if exists (
    select 1 from public.purchases p join public.commerce_products cp on cp.id = p.commerce_product_id
    where p.id = v_purchase_id and cp.sends_access_email = false
  ) then
    update public.email_outbox set status = 'suppressed', updated_at = now() where id = new.id;
  end if;
  return new;
end;
$$;
revoke all on function private.suppress_non_access_product_email() from public, anon, authenticated;
drop trigger if exists email_outbox_suppress_non_access_product_email on public.email_outbox;
create trigger email_outbox_suppress_non_access_product_email
after insert on public.email_outbox for each row execute function private.suppress_non_access_product_email();

-- Prefer a benefit that still needs activation. This lets a customer who
-- purchased the bump activate the included promo and paid extension in order.
create or replace function public.get_belevy_benefit()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare v_user uuid := auth.uid(); v public.benefit_entitlements%rowtype; v_handoff boolean;
begin
  if v_user is null then raise exception using errcode='28000', message='authentication_required'; end if;
  select * into v from public.benefit_entitlements
   where user_id=v_user and status in ('available','activating','active')
   order by (status='available') desc, (status='activating') desc,
            (benefit_code='belevy_promo') desc, created_at asc limit 1;
  if not found then
    return jsonb_build_object('benefit_id',null,'status',null,'duration_days',0,
      'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),'show_handoff',false);
  end if;
  select exists(select 1 from public.action_outcomes where user_id=v_user and status in ('interest','booking')) into v_handoff;
  return jsonb_build_object('benefit_id',v.id,'status',v.status,'duration_days',v.duration_days,
    'benefit_code',v.benefit_code,'external_benefit_id',v.external_benefit_id,
    'activation_enabled',exists(select 1 from public.feature_flags where key='belevy_activation_enabled' and enabled),
    'show_handoff',coalesce(v_handoff,false),'available_at',v.available_at,'eligible_until',v.eligible_until,
    'activated_at',v.activated_at,'expires_at',v.expires_at);
end;
$$;
revoke all on function public.get_belevy_benefit() from public, anon;
grant execute on function public.get_belevy_benefit() to authenticated;

comment on column public.commerce_products.sends_access_email is 'Only products that grant Agenda access may send the access email.';
