import {NextResponse} from "next/server";
export const runtime="nodejs";
export async function GET(){return NextResponse.json({status:"ok",service:"GulfFlow AI",version:"0.5.0",databaseConfigured:Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),aiConfigured:Boolean(process.env.OPENAI_API_KEY&&process.env.ENABLE_LIVE_AI==="true"),timestamp:new Date().toISOString()},{headers:{"Cache-Control":"no-store"}})}
