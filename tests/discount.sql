-- Synthetic records and audit entries are rolled back.
begin;
select set_config('request.jwt.claim.sub',(select id::text from public.profiles where ruolo='admin' and attivo limit 1),true);
set local role authenticated;
do $test$
declare eid uuid; payload jsonb; result jsonb; blocked boolean; bad jsonb;
begin
 insert into public.extras(titolo,nome_esterno,client_type,categoria_target,closure_profile)
 values('V212 TEST ROLLBACK','Synthetic','eurospin','verde','eurospin') returning id into eid;
 payload:='{"pricing_mode":"consuntivo","pricing_category":"verde","dedicated_trip":true,"operator_count":2,"equipment":false,"total_hours":6,"expenses":[{"description":"Materiali e trasferta","amount":260}],"discount_amount":80}'::jsonb;
 result:=public.save_extra_economics_v202(eid,payload,0,null,'verde');
 assert (result->'calculation'->>'subtotal')::numeric=58000;
 assert (result->'calculation'->>'discount')::numeric=8000;
 assert (result->'calculation'->>'total')::numeric=50000;
 assert (select discount_amount=80 from public.extra_labor_hours where extra_id=eid);
 assert public.save_extra_economics_v202(eid,payload,0,null,'verde')=result,'idempotent retry';
 foreach bad in array array['-1'::jsonb,'580.01'::jsonb,'1.001'::jsonb,'"abc"'::jsonb] loop
   blocked:=false;
   begin perform public.save_extra_economics_v202(eid,payload||jsonb_build_object('discount_amount',bad),1,null,'verde');
   exception when invalid_parameter_value then blocked:=true; end;
   assert blocked,'invalid discount must be rejected';
 end loop;
 result:=public.save_extra_economics_v202(eid,payload-'discount_amount',1,null,'verde');
 assert (result->'record'->>'discount_amount')::numeric=80,'old client preserves saved discount';
 result:=public.save_extra_economics_v202(eid,payload||'{"discount_amount":0}',2,null,'verde');
 assert (result->'calculation'->>'total')::numeric=58000;
 result:=public.save_extra_economics_v202(eid,payload||'{"discount_amount":580}',3,null,'verde');
 assert (result->'calculation'->>'total')::numeric=0;
 assert not has_function_privilege('anon','public.save_extra_economics_v202(uuid,jsonb,bigint,uuid,text)','EXECUTE');
end;
$test$;
rollback;
