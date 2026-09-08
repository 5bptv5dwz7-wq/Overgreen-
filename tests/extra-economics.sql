-- Synthetic economic scenarios. Every write rolls back, including audit rows.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare
 actor uuid:=auth.uid(); worker uuid; eid uuid; rid uuid; other_id uuid; item jsonb; result jsonb; data jsonb; expected jsonb; key text;
 cases jsonb:=$cases$[
  {
    "name": "verde: 2 operatori x 3 ore, uscita apposita",
    "input": {
      "total_hours": 6,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 32000,
      "quotePending": false,
      "complete": true,
      "labor": 12000,
      "exit": 20000
    }
  },
  {
    "name": "verde: già sul posto",
    "input": {
      "total_hours": 6,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": false,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 12000,
      "quotePending": false,
      "complete": true,
      "labor": 12000,
      "exit": 0
    }
  },
  {
    "name": "pulizie: consuntivo con spese",
    "input": {
      "total_hours": 9,
      "pricing_mode": "consuntivo",
      "pricing_category": "pulizie",
      "dedicated_trip": true,
      "operator_count": 3,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [
        {
          "description": "Materiali",
          "amount": 18.45
        },
        {
          "description": "Parcheggio",
          "amount": 11.55
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 34200,
      "quotePending": false,
      "complete": true,
      "labor": 16200,
      "exit": 15000
    }
  },
  {
    "name": "pulizie: attrezzature su tutte le ore",
    "input": {
      "total_hours": 9,
      "pricing_mode": "consuntivo",
      "pricing_category": "pulizie",
      "dedicated_trip": true,
      "operator_count": 3,
      "equipment": true,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [
        {
          "description": "Materiali",
          "amount": 30
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 38700,
      "quotePending": false,
      "complete": true,
      "labor": 20700,
      "exit": 15000
    }
  },
  {
    "name": "verde: consuntivo con uscita e spesa",
    "input": {
      "total_hours": 2.5,
      "pricing_mode": "consuntivo",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 1,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [
        {
          "description": "Materiali",
          "amount": 20
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 17000,
      "quotePending": false,
      "complete": true,
      "labor": 5000,
      "exit": 10000
    }
  },
  {
    "name": "preventivo: non somma la manodopera",
    "input": {
      "total_hours": 8,
      "pricing_mode": "preventivo",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": 1000,
      "quote_status": "accettato",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [
        {
          "description": "Spesa extra concordata",
          "amount": 30
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 123000,
      "quotePending": false,
      "complete": true,
      "labor": 16000,
      "exit": 20000
    }
  },
  {
    "name": "preventivo: uscita già inclusa",
    "input": {
      "total_hours": 6,
      "pricing_mode": "preventivo",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": 1000,
      "quote_status": "accettato",
      "quote_exit_included": true,
      "quote_reference": "",
      "expenses": [
        {
          "description": "Spesa extra concordata",
          "amount": 30
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 103000,
      "quotePending": false,
      "complete": true,
      "labor": 12000,
      "exit": 0
    }
  },
  {
    "name": "preventivo: già sul posto senza ore",
    "input": {
      "total_hours": null,
      "pricing_mode": "preventivo",
      "pricing_category": "verde",
      "dedicated_trip": false,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": 1000,
      "quote_status": "accettato",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 100000,
      "quotePending": false,
      "complete": true,
      "exit": 0
    }
  },
  {
    "name": "preventivo in bozza escluso dal totale riepilogo",
    "input": {
      "total_hours": 6,
      "pricing_mode": "preventivo",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": 1000,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 120000,
      "quotePending": true,
      "complete": true,
      "labor": 12000,
      "exit": 20000
    }
  },
  {
    "name": "ore mancanti: non diventano zero",
    "input": {
      "total_hours": null,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": null,
      "quotePending": false,
      "complete": false
    }
  },
  {
    "name": "uscita non dichiarata: bozza",
    "input": {
      "total_hours": 6,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": null,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": null,
      "quotePending": false,
      "complete": false
    }
  },
  {
    "name": "operatori mancanti: bozza",
    "input": {
      "total_hours": 6,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": null,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": null,
      "quotePending": false,
      "complete": false
    }
  },
  {
    "name": "pulizie: centesimi esatti",
    "input": {
      "total_hours": 2.33,
      "pricing_mode": "tariffa",
      "pricing_category": "pulizie",
      "dedicated_trip": true,
      "operator_count": 1,
      "equipment": true,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 10359,
      "quotePending": false,
      "complete": true,
      "labor": 5359,
      "exit": 5000
    }
  },
  {
    "name": "zero ore esplicite con uscita",
    "input": {
      "total_hours": 0,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": true,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [],
      "economic_notes": ""
    },
    "expected": {
      "total": 20000,
      "quotePending": false,
      "complete": true,
      "labor": 0,
      "exit": 20000
    }
  },
  {
    "name": "decimali spese esatti",
    "input": {
      "total_hours": 0,
      "pricing_mode": "tariffa",
      "pricing_category": "verde",
      "dedicated_trip": false,
      "operator_count": 2,
      "equipment": false,
      "quote_amount": null,
      "quote_status": "bozza",
      "quote_exit_included": false,
      "quote_reference": "",
      "expenses": [
        {
          "description": "A",
          "amount": 0.1
        },
        {
          "description": "B",
          "amount": 0.2
        }
      ],
      "economic_notes": ""
    },
    "expected": {
      "total": 30,
      "quotePending": false,
      "complete": true,
      "labor": 0,
      "exit": 0
    }
  }
]
$cases$::jsonb;
 blocked boolean; previous public.extra_labor_hours; n integer;
begin
 for item in select value from jsonb_array_elements(cases) loop
   data:=item->'input';
   insert into public.extras(titolo,nome_esterno,client_type,categoria_target)
     values('V202 QA ROLLBACK','QA fixture','eurospin',data->>'pricing_category') returning id into eid;
   insert into public.attachments(extra_id,tipo,storage_path,nome_file)
     values(eid,'rapportino_eurospin','qa-v202/'||eid||'/report.pdf','QA report.pdf') returning id into rid;
   result:=public.save_extra_economics_v202(eid,data,0,rid,data->>'pricing_category');
   expected:=item->'expected';
   for key in select jsonb_object_keys(expected) loop
     assert result->'calculation'->key is not distinct from expected->key,
       (item->>'name')||' / '||key||': '||(result->'calculation')::text;
   end loop;
   assert (result->'record'->>'revision')::integer=1,'first revision';
   assert public.save_extra_economics_v202(eid,data,0,rid,data->>'pricing_category')=result,'idempotent full save';
 end loop;
 -- Last case: zero hours, already on site, 0.30 expenses.
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"total_hours":2}'::jsonb,0,rid,'verde'); exception when serialization_failure then blocked:=true; end;
 assert blocked,'stale economics cannot overwrite';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"quote_amount":12.345}'::jsonb,1,rid,'verde'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'money precision is validated before rounding';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"hourly_rate":0}'::jsonb,1,rid,'verde'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'client cannot spoof rates';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data||'{"expenses":[{"description":"X","amount":-1}]}'::jsonb,1,rid,'verde'); exception when invalid_parameter_value then blocked:=true; end;
 assert blocked,'negative expense rejected';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data,1,gen_random_uuid(),'verde'); exception when serialization_failure then blocked:=true; end;
 assert blocked,'wrong report rejected';
 -- V201 client still changes hours without clearing pricing fields.
 previous:=public.save_extra_labor_hours_v201(eid,1.5,1,rid);
 assert previous.pricing_mode='tariffa' and previous.expenses=data->'expenses','old client preserves economics';
 assert (public.extra_economic_calculation_v202(previous)->>'total')::numeric=3030,'old client hours remain part of the calculation';
 -- Category change outside the economic dialog requires re-opening it.
 update public.extras set categoria_target='pulizie' where id=eid;
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data,2,rid,'verde'); exception when serialization_failure then blocked:=true; end;
 assert blocked,'category conflict detected';
 assert (select total_hours=1.5 from public.extra_labor_hours where extra_id=eid),'conflict leaves values unchanged';
 update public.extras set categoria_target='verde' where id=eid;
 -- New target without category: supplying it is atomic and retry-safe.
 insert into public.extras(titolo,nome_esterno,client_type) values('V202 QA CATEGORY ROLLBACK','QA fixture','eurospin') returning id into other_id;
 result:=public.save_extra_economics_v202(other_id,data,0,null,null);
 assert (select categoria_target='verde' from public.extras where id=other_id),'missing target category filled';
 assert public.save_extra_economics_v202(other_id,data,0,null,null)=result,'retry after filling category';
 select id into worker from public.profiles where ruolo='dipendente' and attivo limit 1;
 assert worker is not null,'active worker available';
 perform set_config('request.jwt.claim.sub',worker::text,true);
 select count(*) into n from public.extra_labor_hours where extra_id in (eid,other_id);assert n=0,'worker cannot read economic data';
 update public.extra_labor_hours set quote_amount=1 where extra_id=eid;get diagnostics n=row_count;assert n=0,'worker cannot edit economic data';
 blocked:=false;
 begin perform public.save_extra_economics_v202(eid,data,2,rid,'verde'); exception when insufficient_privilege then blocked:=true; end;
 assert blocked,'worker RPC blocked';
 perform set_config('request.jwt.claim.sub',actor::text,true);
 assert not has_function_privilege('anon','public.save_extra_economics_v202(uuid,jsonb,bigint,uuid,text)','EXECUTE'),'anonymous RPC blocked';
 assert not has_table_privilege('anon','public.extra_labor_hours','SELECT'),'anonymous table read blocked';
end;
$test$;
rollback;
select 'PASS: 15 economic scenarios, exact cents, safe retries, conflicts, expenses, category and report changes, V201 compatibility, RLS; all fixtures rolled back' as result;
