-- Complete operational ledger behavior for calibration, inventory, and safety references.

create or replace function public.apply_inventory_transaction()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.transaction_type in ('receipt', 'return') then
    update public.inventory_items
      set quantity_on_hand = quantity_on_hand + new.quantity,
          updated_at = now()
      where id = new.item_id;
  elsif new.transaction_type = 'issue' then
    update public.inventory_items
      set quantity_on_hand = quantity_on_hand - new.quantity,
          updated_at = now()
      where id = new.item_id
        and quantity_on_hand >= new.quantity;
    if not found then
      raise exception 'Insufficient inventory for issue';
    end if;
  elsif new.transaction_type = 'adjustment' then
    -- An adjustment sets counted on-hand quantity to the transaction quantity.
    update public.inventory_items
      set quantity_on_hand = new.quantity,
          updated_at = now()
      where id = new.item_id;
  end if;
  return new;
end;
$$;

create trigger inventory_transaction_apply
before insert on public.inventory_transactions
for each row execute function public.apply_inventory_transaction();

create or replace function public.apply_calibration_event()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  update public.calibration_equipment
  set last_calibrated_at = new.calibrated_at,
      next_calibration_due = new.due_at,
      certificate_reference = coalesce(new.certificate_reference, certificate_reference),
      status = case when new.result = 'failed' then 'out_of_service' else 'in_service' end,
      updated_at = now()
  where id = new.equipment_id;
  return new;
end;
$$;

create trigger calibration_event_apply
after insert on public.calibration_events
for each row execute function public.apply_calibration_event();

create sequence if not exists public.safety_incident_reference_seq;
create or replace function public.assign_safety_incident_reference()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if new.reference_number is null or btrim(new.reference_number) = '' then
    new.reference_number := 'SAFE-' || to_char(now(), 'YYYY') || '-' ||
      lpad(nextval('public.safety_incident_reference_seq')::text, 6, '0');
  end if;
  return new;
end;
$$;

create trigger safety_incident_reference_before_insert
before insert on public.safety_incidents
for each row execute function public.assign_safety_incident_reference();
