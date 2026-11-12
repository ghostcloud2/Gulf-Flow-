import {NextResponse} from "next/server";
import {z} from "zod";
import {getAuthenticatedClient} from "../../../../lib/auth";
export const runtime="nodejs";
const input=z.object({business_id:z.string().uuid(),booking_id:z.string().uuid(),status:z.enum(["pending","confirmed","cancelled"])}).strict();
export async function PATCH(request:Request){const db=getAuthenticatedClient(request);if(!db)return NextResponse.json({error:"Authentication required"},{status:401});let body:unknown;try{body=await request.json()}catch{return NextResponse.json({error:"Invalid JSON"},{status:400})}const parsed=input.safeParse(body);if(!parsed.success)return NextResponse.json({error:"Invalid fields"},{status:400});const {data,error}=await db.from("booking_requests").update({status:parsed.data.status}).eq("id",parsed.data.booking_id).eq("business_id",parsed.data.business_id).select("id,status").single();return error?NextResponse.json({error:"Update denied or booking not found"},{status:403}):NextResponse.json({booking:data})}
