-- Fase 11: guardrails for the anonymous public booking RPC.
-- The exclusion constraint remains the final protection against double booking.

create or replace function public.create_public_booking(p_slug text,p_service_id uuid,p_starts_at timestamptz,p_customer_name text,p_customer_contact text default null)
returns jsonb language plpgsql security definer set search_path=pg_catalog,public as $$
declare
  v_workspace public.workspaces%rowtype;
  v_service public.services%rowtype;
  v_provider public.providers%rowtype;
  v_customer public.customers%rowtype;
  v_appointment public.appointments%rowtype;
  v_ends timestamptz;
begin
  if p_slug is null or length(trim(p_slug)) > 160 or p_service_id is null or p_starts_at is null
     or p_starts_at <= now() or p_starts_at > now() + interval '31 days'
     or p_customer_name is null or length(trim(p_customer_name)) < 2 or length(trim(p_customer_name)) > 120
     or (p_customer_contact is not null and length(trim(p_customer_contact)) > 240) then
    raise exception using errcode='22023',message='invalid_booking';
  end if;

  select * into v_workspace from public.workspaces where slug=lower(trim(p_slug)) and active;
  if not found then raise exception using errcode='22023',message='booking_unavailable'; end if;

  select * into v_service from public.services where id=p_service_id and workspace_id=v_workspace.id and active;
  if not found then raise exception using errcode='22023',message='invalid_booking'; end if;

  select p.* into v_provider
    from public.providers p
    join public.service_providers sp on sp.provider_id=p.id
   where sp.service_id=v_service.id and p.workspace_id=v_workspace.id and p.active
   order by p.created_at limit 1;
  if not found then raise exception using errcode='22023',message='booking_unavailable'; end if;

  v_ends:=p_starts_at+(v_service.duration_minutes+v_service.buffer_minutes)*interval '1 minute';
  if not exists(
    select 1 from public.availability_rules ar
     where ar.provider_id=v_provider.id
       and ar.weekday=extract(dow from p_starts_at at time zone v_workspace.timezone)::int
       and ar.active
       and (p_starts_at at time zone v_workspace.timezone)::time>=ar.starts_at
       and (v_ends at time zone v_workspace.timezone)::time<=ar.ends_at
  ) or exists(
    select 1 from public.availability_exceptions ae
     where ae.provider_id=v_provider.id and ae.kind='blocked'
       and tstzrange(ae.starts_at,ae.ends_at,'[)') && tstzrange(p_starts_at,v_ends,'[)')
  ) then
    raise exception using errcode='22023',message='slot_unavailable';
  end if;

  insert into public.customers(workspace_id,display_name,contact)
  values(v_workspace.id,trim(p_customer_name),nullif(trim(p_customer_contact),'')) returning * into v_customer;
  insert into public.appointments(workspace_id,service_id,provider_id,customer_id,starts_at,ends_at,status,source)
  values(v_workspace.id,v_service.id,v_provider.id,v_customer.id,p_starts_at,v_ends,'confirmed','public_booking') returning * into v_appointment;
  insert into public.appointment_events(appointment_id,event_type,payload)
  values(v_appointment.id,'created',jsonb_build_object('source','public_booking'));
  return jsonb_build_object('ok',true,'appointment_id',v_appointment.id,'service_name',v_service.name,'starts_at',v_appointment.starts_at,'ends_at',v_appointment.ends_at);
exception when exclusion_violation then
  raise exception using errcode='23P01',message='slot_unavailable';
end; $$;

revoke all on function public.create_public_booking(text,uuid,timestamptz,text,text) from public;
grant execute on function public.create_public_booking(text,uuid,timestamptz,text,text) to anon,authenticated;
