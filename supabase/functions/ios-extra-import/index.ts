import {createClient} from 'npm:@supabase/supabase-js@2.57.4';
import {createHandler} from './handler.mjs';
const base=Deno.env.get('SUPABASE_URL')!;
const db=createClient(base,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
// The handler validates either an Auth user or the scoped, revocable Shortcut token.
Deno.serve(createHandler(db,base,'https://5bptv5dwz7-wq.github.io/Overgreen-/'));
