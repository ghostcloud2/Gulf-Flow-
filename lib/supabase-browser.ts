"use client";
import {createClient,type SupabaseClient} from "@supabase/supabase-js";
let client:SupabaseClient|null=null;
export function supabaseConfigured(){
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY));
}
export function getBrowserClient():SupabaseClient|null{
  if(typeof window==="undefined"||!supabaseConfigured())return null;
  if(!client){
    const url=process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key=(process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)!;
    client=createClient(url,key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
  }
  return client;
}
export function explainSupabaseError(error:unknown):string{
  const msg=error instanceof Error?error.message:String(error||"Unknown error");
  if(/relation .* does not exist|schema cache|could not find the function|PGRST202|PGRST205/i.test(msg))
    return "The Universal Business OS database migration has not been applied. Run 001_core.sql and 002_universal_business_os.sql in your Supabase SQL Editor.";
  return msg;
}
