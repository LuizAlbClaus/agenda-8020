-- A remote grant is idempotent by benefit_id. If the remote call succeeds but
-- the response is lost, keep the local entitlement retryable so the next
-- attempt can reconcile it instead of leaving the customer permanently stuck.
create or replace function public.get_belevy_benefit()
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  v_user uuid := auth.uid();
  v public.benefit_entitlements%rowtype;
  v_handoff boolean;
  v_total_days integer;
begin
  if v_user is null then
    raise exception using errcode = '28000', message = 'authentication_required';
  end if;

  select * into v
  from public.benefit_entitlements
  where user_id = v_user
    and status in ('available', 'failed', 'activating', 'active')
    and (status not in ('available', 'failed') or eligible_until > now())
  order by
    case when status in ('available', 'failed') then 0 when status = 'activating' then 1 else 2 end,
    (benefit_code = 'belevy_promo') desc,
    created_at asc
  limit 1;

  if not found then
    return jsonb_build_object(
      'benefit_id', null,
      'status', null,
      'duration_days', 0,
      'total_days', 0,
      'activation_enabled', exists(select 1 from public.feature_flags where key = 'belevy_activation_enabled' and enabled),
      'show_handoff', false
    );
  end if;

  select coalesce(sum(duration_days), 0)::integer into v_total_days
  from public.benefit_entitlements
  where user_id = v_user
    and status in ('available', 'failed', 'activating', 'active')
    and (status not in ('available', 'failed') or eligible_until > now());
  select exists(select 1 from public.action_outcomes where user_id = v_user and status in ('interest', 'booking')) into v_handoff;

  return jsonb_build_object(
    'benefit_id', v.id,
    'status', case when v.status = 'failed' then 'available' else v.status end,
    'duration_days', v.duration_days,
    'total_days', v_total_days,
    'benefit_code', v.benefit_code,
    'external_benefit_id', v.external_benefit_id,
    'activation_enabled', exists(select 1 from public.feature_flags where key = 'belevy_activation_enabled' and enabled),
    'show_handoff', coalesce(v_handoff, false),
    'available_at', v.available_at,
    'eligible_until', v.eligible_until,
    'activated_at', v.activated_at,
    'expires_at', v.expires_at
  );
end;
$$;

revoke all on function public.get_belevy_benefit() from public, anon;
grant execute on function public.get_belevy_benefit() to authenticated;

create or replace function public.belevy_activation_start(p_user_id uuid, p_benefit_id uuid, p_duration_days integer)
returns jsonb language plpgsql security definer set search_path = pg_catalog, public as $$
declare
  b public.benefit_entitlements%rowtype;
begin
  if coalesce(current_setting('request.jwt.claim.role', true), '') <> 'service_role' then
    raise exception using errcode = '42501', message = 'service_role_required';
  end if;
  if not exists(select 1 from public.feature_flags where key = 'belevy_activation_enabled' and enabled) then
    raise exception using errcode = '42501', message = 'belevy_activation_disabled';
  end if;
  if not exists(select 1 from public.entitlements where user_id = p_user_id and product_code = 'agenda_8020' and status = 'active' and expires_at > now()) then
    raise exception using errcode = '42501', message = 'entitlement_required';
  end if;
  select * into b
  from public.benefit_entitlements
  where id = p_benefit_id
    and user_id = p_user_id
    and status in ('available', 'failed')
    and eligible_until > now()
  for update;
  if not found then
    raise exception using errcode = '42501', message = 'belevy_benefit_unavailable';
  end if;
  if p_duration_days is not null and p_duration_days is distinct from b.duration_days then
    raise exception using errcode = '22023', message = 'invalid_benefit_duration';
  end if;
  update public.benefit_entitlements set status = 'activating', updated_at = now() where id = b.id returning * into b;
  return jsonb_build_object(
    'activation_id', b.id,
    'benefit_id', b.id,
    'benefit_code', b.benefit_code,
    'external_benefit_id', b.external_benefit_id,
    'duration_days', b.duration_days,
    'status', b.status
  );
end;
$$;

revoke all on function public.belevy_activation_start(uuid, uuid, integer) from public, anon, authenticated;
grant execute on function public.belevy_activation_start(uuid, uuid, integer) to service_role;
