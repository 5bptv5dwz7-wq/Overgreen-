-- Extends the V201 admin-only record, preserving existing hours and the old RPC.
alter table public.extra_labor_hours
  add column pricing_mode text check (pricing_mode in ('tariffa','preventivo','consuntivo')),
  add column pricing_category text check (pricing_category in ('verde','pulizie')),
  add column dedicated_trip boolean,
  add column operator_count integer check (operator_count between 1 and 99),
  add column equipment boolean not null default false,
  add column quote_amount numeric(9,2) check (quote_amount between 0 and 9999999.99),
  add column quote_status text not null default 'bozza' check (quote_status in ('bozza','inviato','accettato','rifiutato')),
  add column quote_exit_included boolean not null default false,
  add column quote_reference text not null default '' check (length(quote_reference)<=200),
  add column expenses jsonb not null default '[]'::jsonb check (jsonb_typeof(expenses)='array' and jsonb_array_length(expenses)<=50),
  add column economic_notes text not null default '' check (length(economic_notes)<=2000),
  add column hourly_rate numeric(5,2) check (hourly_rate in (18,20,23)),
  add column exit_rate numeric(5,2) check (exit_rate in (50,100)),
  add column pricing_version text;

create function public.extra_economic_calculation_v202(p public.extra_labor_hours)
returns jsonb language plpgsql immutable security invoker set search_path='' as $$
declare
  v_missing text[]:='{}'; v_labor numeric; v_base numeric; v_exit numeric; v_expenses numeric:=0;
  v_quote boolean:=coalesce(p.pricing_mode='preventivo',false); v_included boolean; v_complete boolean;
begin
  if p.pricing_mode is null then v_missing:=array_append(v_missing,'modalità'); end if;
  if p.pricing_category is null then v_missing:=array_append(v_missing,'categoria'); end if;
  if p.dedicated_trip is null then v_missing:=array_append(v_missing,'tipo di uscita'); end if;
  if p.operator_count is null then v_missing:=array_append(v_missing,'numero operatori'); end if;
  if v_quote and p.quote_amount is null then v_missing:=array_append(v_missing,'importo preventivo'); end if;
  if not v_quote and p.total_hours is null then v_missing:=array_append(v_missing,'ore'); end if;
  if p.hourly_rate is null or p.exit_rate is null then v_missing:=array_append(v_missing,'tariffe'); end if;
  v_labor:=round(p.total_hours*p.hourly_rate,2);
  v_included:=v_quote and p.dedicated_trip is true and p.quote_exit_included;
  v_exit:=case when p.dedicated_trip is false or v_included then 0 when p.dedicated_trip is true then p.operator_count*p.exit_rate else null end;
  select coalesce(sum((x->>'amount')::numeric),0) into v_expenses from jsonb_array_elements(p.expenses) x;
  v_base:=case when v_quote then p.quote_amount else v_labor end;
  v_complete:=cardinality(v_missing)=0;
  return jsonb_build_object('complete',v_complete,'missing',to_jsonb(v_missing),
    'labor',v_labor*100,'base',v_base*100,'exit',v_exit*100,'exitIncluded',v_included,'expenses',v_expenses*100,
    'total',case when v_complete then (v_base+v_exit+v_expenses)*100 else null end,
    'quotePending',v_quote and p.quote_status<>'accettato');
end;
$$;
revoke all on function public.extra_economic_calculation_v202(public.extra_labor_hours) from public,anon;
grant execute on function public.extra_economic_calculation_v202(public.extra_labor_hours) to authenticated,service_role;

create function public.save_extra_economics_v202(
  p_extra_id uuid,p_values jsonb,p_expected_revision bigint,p_source_attachment_id uuid,p_expected_extra_category text
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare
  v_old public.extra_labor_hours; v_new public.extra_labor_hours; v_report uuid; v_category text;
  v_exists boolean; v_payload jsonb; v_item jsonb; v_expenses jsonb:='[]'; v_amount numeric;
  v_hours numeric; v_quote numeric; v_description text; v_key text;
  v_keys text[]:=array['total_hours','pricing_mode','pricing_category','dedicated_trip','operator_count','equipment',
    'quote_amount','quote_status','quote_exit_included','quote_reference','expenses','economic_notes'];
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Solo un amministratore attivo può gestire gli importi.' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision<0 or p_values is null or jsonb_typeof(p_values)<>'object' then
    raise exception 'Dati economici non validi.' using errcode='22023'; end if;
  for v_key in select jsonb_object_keys(p_values) loop
    if not v_key=any(v_keys) then raise exception 'Campo economico non riconosciuto: %',v_key using errcode='22023'; end if;
  end loop;
  -- Validate decimals before converting into fixed-scale columns (which would round).
  foreach v_key in array array['total_hours','quote_amount'] loop
    if p_values->>v_key is not null and (jsonb_typeof(p_values->v_key)<>'number' or (p_values->>v_key)::numeric<0 or
      (p_values->>v_key)::numeric>case when v_key='total_hours' then 99999.99 else 9999999.99 end or
      (p_values->>v_key)::numeric<>round((p_values->>v_key)::numeric,2)) then
      raise exception 'Ore e importi devono essere positivi, con al massimo due decimali.' using errcode='22023'; end if;
  end loop;
  if p_values->>'operator_count' is not null and (jsonb_typeof(p_values->'operator_count')<>'number' or
    (p_values->>'operator_count')::numeric<>trunc((p_values->>'operator_count')::numeric) or
    (p_values->>'operator_count')::numeric not between 1 and 99) then
    raise exception 'Inserisci da 1 a 99 operatori.' using errcode='22023'; end if;
  foreach v_key in array array['equipment','quote_exit_included','dedicated_trip'] loop
    if p_values->>v_key is not null and jsonb_typeof(p_values->v_key)<>'boolean' then
      raise exception 'Scelta uscita o attrezzature non valida.' using errcode='22023'; end if;
  end loop;
  if jsonb_typeof(coalesce(p_values->'expenses','[]'::jsonb))<>'array' or jsonb_array_length(coalesce(p_values->'expenses','[]'::jsonb))>50 then
    raise exception 'Inserisci al massimo 50 spese.' using errcode='22023'; end if;
  for v_item in select value from jsonb_array_elements(coalesce(p_values->'expenses','[]'::jsonb)) loop
    v_description:=btrim(v_item->>'description');
    if jsonb_typeof(v_item)<>'object' or v_description is null or length(v_description) not between 1 and 200 or
      jsonb_typeof(v_item->'amount') is distinct from 'number' then
      raise exception 'Ogni spesa richiede una descrizione e un importo.' using errcode='22023'; end if;
    v_amount:=(v_item->>'amount')::numeric;
    if v_amount not between 0 and 9999999.99 or v_amount<>round(v_amount,2) then
      raise exception 'Importo spesa non valido.' using errcode='22023'; end if;
    v_expenses:=v_expenses||jsonb_build_array(jsonb_build_object('description',v_description,'amount',v_amount));
  end loop;
  v_payload:=jsonb_build_object('total_hours',p_values->'total_hours','pricing_mode',nullif(p_values->>'pricing_mode',''),
    'pricing_category',nullif(p_values->>'pricing_category',''),'dedicated_trip',p_values->'dedicated_trip','operator_count',p_values->'operator_count',
    'equipment',coalesce((p_values->>'equipment')::boolean,false),'quote_amount',p_values->'quote_amount',
    'quote_status',coalesce(nullif(p_values->>'quote_status',''),'bozza'),'quote_exit_included',coalesce((p_values->>'quote_exit_included')::boolean,false),
    'quote_reference',btrim(coalesce(p_values->>'quote_reference','')),'expenses',v_expenses,'economic_notes',btrim(coalesce(p_values->>'economic_notes','')));
  v_new:=jsonb_populate_record(null::public.extra_labor_hours,v_payload);
  if v_new.pricing_mode is not null and v_new.pricing_mode not in ('tariffa','preventivo','consuntivo') or
    v_new.pricing_category is not null and v_new.pricing_category not in ('verde','pulizie') or
    v_new.quote_status not in ('bozza','inviato','accettato','rifiutato') or length(v_new.quote_reference)>200 or length(v_new.economic_notes)>2000 then
    raise exception 'Modalità, categoria o note non valide.' using errcode='22023'; end if;
  if v_new.pricing_category is distinct from 'pulizie' then v_new.equipment:=false; end if;
  v_new.hourly_rate:=case v_new.pricing_category when 'verde' then 20 when 'pulizie' then case when v_new.equipment then 23 else 18 end else null end;
  v_new.exit_rate:=case v_new.pricing_category when 'verde' then 100 when 'pulizie' then 50 else null end;
  v_new.pricing_version:='eurospin_v202';
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('extra-hours:'||p_extra_id::text,201));
  select categoria_target into v_category from public.extras where id=p_extra_id and client_type='eurospin' for update;
  if not found then raise exception 'Extra Eurospin non trovato o non accessibile.' using errcode='22023'; end if;
  select id into v_report from public.attachments where extra_id=p_extra_id and tipo='rapportino_eurospin' order by created_at desc,id desc limit 1;
  if v_report is distinct from p_source_attachment_id then raise exception 'Il rapportino è cambiato. Riapri la scheda e controlla le ore.' using errcode='40001'; end if;
  select * into v_old from public.extra_labor_hours where extra_id=p_extra_id for update;v_exists:=found;
  if v_exists and v_old.revision<>p_expected_revision then
    if (to_jsonb(v_old)-array['extra_id','revision','updated_by','updated_at','source_attachment_id'])=
       (to_jsonb(v_new)-array['extra_id','revision','updated_by','updated_at','source_attachment_id']) and
       v_old.source_attachment_id is not distinct from p_source_attachment_id and v_category is not distinct from v_new.pricing_category then
      return jsonb_build_object('record',to_jsonb(v_old),'calculation',public.extra_economic_calculation_v202(v_old));
    end if;
    raise exception 'I dati economici sono stati modificati da un’altra sessione. Annota le modifiche e riapri la scheda.' using errcode='40001';
  end if;
  if not v_exists and p_expected_revision<>0 then raise exception 'I dati sono cambiati. Riapri la scheda.' using errcode='40001'; end if;
  if v_category is distinct from p_expected_extra_category or v_category is not null and v_category is distinct from v_new.pricing_category then
    raise exception 'La categoria del target è cambiata. Riapri la scheda per applicare le tariffe corrette.' using errcode='40001'; end if;
  -- If the target had no category, the admin can supply it in this same transaction.
  if v_category is null and v_new.pricing_category is not null then
    update public.extras set categoria_target=v_new.pricing_category where id=p_extra_id;
  end if;
  v_new.extra_id:=p_extra_id;v_new.revision:=coalesce(v_old.revision,0)+1;v_new.updated_by:=auth.uid();v_new.updated_at:=now();v_new.source_attachment_id:=p_source_attachment_id;
  if v_exists then
    update public.extra_labor_hours set total_hours=v_new.total_hours,revision=v_new.revision,updated_by=v_new.updated_by,updated_at=v_new.updated_at,
      source_attachment_id=v_new.source_attachment_id,pricing_mode=v_new.pricing_mode,pricing_category=v_new.pricing_category,dedicated_trip=v_new.dedicated_trip,
      operator_count=v_new.operator_count,equipment=v_new.equipment,quote_amount=v_new.quote_amount,quote_status=v_new.quote_status,
      quote_exit_included=v_new.quote_exit_included,quote_reference=v_new.quote_reference,expenses=v_new.expenses,economic_notes=v_new.economic_notes,
      hourly_rate=v_new.hourly_rate,exit_rate=v_new.exit_rate,pricing_version=v_new.pricing_version where extra_id=p_extra_id;
  else
    insert into public.extra_labor_hours select v_new.*;
  end if;
  return jsonb_build_object('record',to_jsonb(v_new),'calculation',public.extra_economic_calculation_v202(v_new));
end;
$$;
revoke all on function public.save_extra_economics_v202(uuid,jsonb,bigint,uuid,text) from public,anon;
grant execute on function public.save_extra_economics_v202(uuid,jsonb,bigint,uuid,text) to authenticated;
