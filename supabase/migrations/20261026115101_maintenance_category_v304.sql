alter table public.extras drop constraint extras_categoria_target_check, add constraint extras_categoria_target_check check (categoria_target in ('verde','pulizie','manutenzioni'));
alter table public.extra_labor_hours
drop constraint extra_labor_hours_pricing_category_check, add constraint extra_labor_hours_pricing_category_check check (pricing_category in ('verde','pulizie','manutenzioni')),
drop constraint extra_labor_hours_hourly_rate_check, add constraint extra_labor_hours_hourly_rate_check check (hourly_rate in (18,20,23,28,33)),
drop constraint extra_labor_hours_night_hourly_rate_check, add constraint extra_labor_hours_night_hourly_rate_check check (night_hourly_rate in (25,30,36,41));
CREATE OR REPLACE FUNCTION public.save_extra_economics_v202(p_extra_id uuid, p_values jsonb, p_expected_revision bigint, p_source_attachment_id uuid, p_expected_extra_category text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
  v_old public.extra_labor_hours; v_new public.extra_labor_hours; v_report uuid; v_category text; v_operational_night numeric;
  v_exists boolean; v_payload jsonb; v_item jsonb; v_expenses jsonb:='[]'; v_amount numeric;
  v_hours numeric; v_quote numeric; v_description text; v_key text;
  v_keys text[]:=array['total_hours','pricing_mode','pricing_category','dedicated_trip','operator_count','equipment',
    'quote_amount','quote_status','quote_exit_included','quote_reference','expenses','economic_notes','discount_amount','night_hours','expected_night_hours','cleaning_scope'];
begin
  if not coalesce(public.is_admin(),false) then raise exception 'Solo un amministratore attivo può gestire gli importi.' using errcode='42501'; end if;
  if p_expected_revision is null or p_expected_revision<0 or p_values is null or jsonb_typeof(p_values)<>'object' then
    raise exception 'Dati economici non validi.' using errcode='22023'; end if;
  for v_key in select jsonb_object_keys(p_values) loop
    if not v_key=any(v_keys) then raise exception 'Campo economico non riconosciuto: %',v_key using errcode='22023'; end if;
  end loop;
  -- Validate decimals before converting into fixed-scale columns (which would round).
  foreach v_key in array array['total_hours','night_hours','expected_night_hours','quote_amount','discount_amount'] loop
    if p_values->>v_key is not null and (jsonb_typeof(p_values->v_key)<>'number' or (p_values->>v_key)::numeric<0 or
      (p_values->>v_key)::numeric>case when v_key in ('total_hours','night_hours','expected_night_hours') then 99999.99 else 9999999.99 end or
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
  v_payload:=jsonb_build_object('discount_amount',coalesce(p_values->'discount_amount','0'::jsonb),'total_hours',p_values->'total_hours','pricing_mode',nullif(p_values->>'pricing_mode',''),
    'pricing_category',nullif(p_values->>'pricing_category',''),'dedicated_trip',p_values->'dedicated_trip','operator_count',p_values->'operator_count',
    'equipment',coalesce((p_values->>'equipment')::boolean,false),'quote_amount',p_values->'quote_amount',
    'quote_status',coalesce(nullif(p_values->>'quote_status',''),'bozza'),'quote_exit_included',coalesce((p_values->>'quote_exit_included')::boolean,false),
    'quote_reference',btrim(coalesce(p_values->>'quote_reference','')),'expenses',v_expenses,'economic_notes',btrim(coalesce(p_values->>'economic_notes','')));
  v_new:=jsonb_populate_record(null::public.extra_labor_hours,v_payload);
  if v_new.pricing_mode is not null and v_new.pricing_mode not in ('tariffa','preventivo','consuntivo') or
    v_new.pricing_category is not null and v_new.pricing_category not in ('verde','pulizie','manutenzioni') or
    v_new.quote_status not in ('bozza','inviato','accettato','rifiutato') or length(v_new.quote_reference)>200 or length(v_new.economic_notes)>2000 then
    raise exception 'Modalità, categoria o note non valide.' using errcode='22023'; end if;
  if coalesce(v_new.pricing_category,'') not in ('pulizie','manutenzioni') then v_new.equipment:=false; end if;
  v_new.hourly_rate:=case v_new.pricing_category when 'manutenzioni' then case when v_new.equipment then 33 else 28 end when 'verde' then 20 when 'pulizie' then case when v_new.equipment then 23 else 18 end else null end;
  v_new.exit_rate:=case v_new.pricing_category when 'manutenzioni' then 50 when 'verde' then 100 when 'pulizie' then 50 else null end;
  v_new.pricing_version:='eurospin_v304';
  perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('extra-hours:'||p_extra_id::text,201));
  select categoria_target,night_hours into v_category,v_operational_night from public.extras where id=p_extra_id and client_type='eurospin' for update;
  if not found then raise exception 'Extra Eurospin non trovato o non accessibile.' using errcode='22023'; end if;
  select id into v_report from public.attachments where extra_id=p_extra_id and tipo='rapportino_eurospin' order by created_at desc,id desc limit 1;
  if v_report is distinct from p_source_attachment_id then raise exception 'Il rapportino è cambiato. Riapri la scheda e controlla le ore.' using errcode='40001'; end if;
  select * into v_old from public.extra_labor_hours where extra_id=p_extra_id for update;v_exists:=found;
  -- Omitted by older clients: preserve the saved classification.
  v_new.cleaning_scope:=case when p_values ? 'cleaning_scope' then nullif(p_values->>'cleaning_scope','') else v_old.cleaning_scope end;
  if v_new.pricing_category='pulizie' then
    if p_values ? 'cleaning_scope' and (v_new.cleaning_scope is null or v_new.cleaning_scope not in ('interni','esterni')) then
      raise exception 'Indica se le pulizie sono interne (reverse charge) o esterne (IVA ordinaria).' using errcode='22023';
    end if;
  else
    v_new.cleaning_scope:=null;
  end if;
  -- Older clients omit this field: preserve any saved discount.
  v_new.discount_amount:=case when p_values ? 'discount_amount' then coalesce((p_values->>'discount_amount')::numeric,0) else coalesce(v_old.discount_amount,0) end;
  -- Older clients preserve the saved night breakdown; the new dialog confirms the operational hours.
  v_new.night_hours:=case when p_values ? 'night_hours' then coalesce((p_values->>'night_hours')::numeric,0) else coalesce(v_old.night_hours,0) end;
  if coalesce(v_new.pricing_category,'') not in ('pulizie','manutenzioni') then v_new.night_hours:=0; end if;
  if v_new.total_hours is not null and v_new.night_hours>v_new.total_hours then
    raise exception 'Le ore notturne non possono superare le ore complessive.' using errcode='22023'; end if;
  v_new.night_hourly_rate:=case when v_new.pricing_category='manutenzioni' then case when v_new.equipment then 41 else 36 end when v_new.pricing_category='pulizie' then case when v_new.equipment then 30 else 25 end else null end;
  if (public.extra_economic_calculation_v202(v_new)->>'subtotal')::numeric is not null and
    v_new.discount_amount*100>(public.extra_economic_calculation_v202(v_new)->>'subtotal')::numeric then
    raise exception 'Lo sconto non può superare il subtotale.' using errcode='22023'; end if;
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
  if p_values ? 'expected_night_hours' and coalesce((p_values->>'expected_night_hours')::numeric,0) is distinct from v_operational_night then
    raise exception 'Le ore notturne del target sono cambiate. Riapri Economia per ricontrollarle.' using errcode='40001'; end if;
  if p_values ? 'night_hours' and v_new.pricing_category in ('pulizie','manutenzioni') then
    update public.extras set night_hours=v_new.night_hours where id=p_extra_id;
  end if;
  -- If the target had no category, the admin can supply it in this same transaction.
  if v_category is null and v_new.pricing_category is not null then
    update public.extras set categoria_target=v_new.pricing_category where id=p_extra_id;
  end if;
  v_new.extra_id:=p_extra_id;v_new.revision:=coalesce(v_old.revision,0)+1;v_new.updated_by:=auth.uid();v_new.updated_at:=now();v_new.source_attachment_id:=p_source_attachment_id;
  if v_exists then
    update public.extra_labor_hours set total_hours=v_new.total_hours,revision=v_new.revision,updated_by=v_new.updated_by,updated_at=v_new.updated_at,
      cleaning_scope=v_new.cleaning_scope,source_attachment_id=v_new.source_attachment_id,pricing_mode=v_new.pricing_mode,pricing_category=v_new.pricing_category,dedicated_trip=v_new.dedicated_trip,
      operator_count=v_new.operator_count,equipment=v_new.equipment,quote_amount=v_new.quote_amount,quote_status=v_new.quote_status,
      quote_exit_included=v_new.quote_exit_included,quote_reference=v_new.quote_reference,expenses=v_new.expenses,discount_amount=v_new.discount_amount,economic_notes=v_new.economic_notes,
      night_hours=v_new.night_hours,night_hourly_rate=v_new.night_hourly_rate,
      hourly_rate=v_new.hourly_rate,exit_rate=v_new.exit_rate,pricing_version=v_new.pricing_version where extra_id=p_extra_id;
  else
    insert into public.extra_labor_hours select v_new.*;
  end if;
  return jsonb_build_object('record',to_jsonb(v_new),'calculation',public.extra_economic_calculation_v202(v_new));
end;
$function$
;

