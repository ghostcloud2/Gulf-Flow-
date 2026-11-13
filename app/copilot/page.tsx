"use client";
import Link from "next/link";
import {useEffect,useRef,useState,type FormEvent} from "react";
import {ArrowRight,Bot,BookOpen,CheckCircle2,ChevronDown,Command,Info,Lock,MessageSquare,Send,ShieldCheck,Sparkles,User} from "lucide-react";
import {GFShell,GFEmpty,GFState} from "../../components/gf-shell";
import {getBrowserClient,explainSupabaseError} from "../../lib/supabase-browser";
type Company={id:string;name:string};
type Source={id:string;title:string;kind:string};
type Message={id:number;role:"user"|"bot";text:string;sources?:Source[];mode?:string};
const suggestions=["How is this company structured?","Which modules are enabled for this business?","Explain our booking approval workflow","What can our AI assistants do safely?","How do we create custom business entities?","Which workflows exist in this company?"];
export default function CopilotPage(){
 const [companies,setCompanies]=useState<Company[]>([]);
 const [id,setId]=useState("");
 const [authorized,setAuthorized]=useState<boolean|null>(null);
 const [question,setQuestion]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [messages,setMessages]=useState<Message[]>([{id:1,role:"bot",text:"Welcome to GulfFlow Intelligence. Select a company and ask how its organization, workflows, knowledge base or modules operate. Answers are scoped to your authorized company and reference approved documentation."}]);
 const bottom=useRef<HTMLDivElement|null>(null);
 const idSequence=useRef(2);
 useEffect(()=>{const db=getBrowserClient();if(!db){setAuthorized(false);setError("Supabase is not configured.");return}
   void (async()=>{const {data:{user}}=await db.auth.getUser();if(!user){setAuthorized(false);return}setAuthorized(true);
    const {data:members,error}=await db.from("business_memberships").select("business_id");
    if(error){setError(explainSupabaseError(error));return}
    const ids=(members||[]).map(m=>m.business_id);
    if(!ids.length)return;
    const {data:found,error:companyError}=await db.from("businesses").select("id,name").in("id",ids);
    if(companyError){setError(explainSupabaseError(companyError));return}
    const all=(found||[]) as Company[];setCompanies(all);
    const desired=new URLSearchParams(window.location.search).get("business");
    setId(desired&&all.some(x=>x.id===desired)?desired:all[0]?.id||"");
   })()
 },[]);
 useEffect(()=>{bottom.current?.scrollIntoView({behavior:"smooth",block:"end"})},[messages,busy]);
 async function submit(event?:FormEvent){
  event?.preventDefault();
  if(!id||!question.trim()||busy)return;
  const text=question.trim();setQuestion("");setError("");
  setMessages(v=>[...v,{id:idSequence.current++,role:"user",text}]);setBusy(true);
  const db=getBrowserClient();
  if(!db){setError("Authentication is not configured.");setBusy(false);return}
  try{
   const {data:{session},error:sessionError}=await db.auth.getSession();
   if(sessionError||!session?.access_token)throw new Error("Your session has expired. Please sign in again.");
   const res=await fetch("/api/copilot",{method:"POST",headers:{"Content-Type":"application/json","Authorization":"Bearer "+session.access_token},body:JSON.stringify({business_id:id,question:text})});
   const data=await res.json() as {answer?:string;error?:string;mode?:string;sources?:Source[]};
   if(!res.ok||!data.answer)throw new Error(data.error||"Unable to retrieve assistant response.");
   setMessages(v=>[...v,{id:idSequence.current++,role:"bot",text:data.answer||"",sources:data.sources||[],mode:data.mode}]);
  }catch(e){setError(explainSupabaseError(e));setMessages(v=>[...v,{id:idSequence.current++,role:"bot",text:"The company assistant could not complete that request. Please check your database setup, sign-in session or connection and try again."}])}finally{setBusy(false)}
 }
 function choose(q:string){setQuestion(q)}
 return <GFShell eyebrow="GULFFLOW INTELLIGENCE · VERIFIED KNOWLEDGE" title="Ask your business" description="One internal Copilot that understands GulfFlow's modules and your company's approved configuration, without crossing company or permission boundaries." aside={<GFState tone="positive"><ShieldCheck size={13}/> Company-scoped answers</GFState>}>
  <div className="gf-grid-2" style={{gridTemplateColumns:"minmax(0,1.8fr) minmax(260px,.8fr)",alignItems:"start"}}>
    <section className="gf-card"><div className="gf-between" style={{marginBottom:20,flexWrap:"wrap"}}><div className="gf-row"><span className="gf-feature-icon" style={{margin:0}}><Bot size={24}/></span><div><h2 style={{marginBottom:4}}>GulfFlow Intelligence</h2><div className="gf-muted">Authorized knowledge · Read-only answers</div></div></div>{authorized&&companies.length>0?<select className="gf-select" value={id} style={{width:230,maxWidth:"100%"}} aria-label="Select company" onChange={e=>{setId(e.target.value);setMessages([{id:idSequence.current++,role:"bot",text:"Company changed. New answers will be scoped to the selected company."}])}}>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>:<GFState tone="warning">Sign-in required</GFState>}</div>
    {!authorized?<GFEmpty icon={<Lock size={22}/>} title="Private company knowledge"><span>{authorized===null?"Checking your access...":"Sign in to use GulfFlow Intelligence."}</span><div style={{marginTop:18}}><Link className="gf-btn gf-btn-primary" href="/sign-in">Sign in <ArrowRight size={16}/></Link></div></GFEmpty>:companies.length===0?<GFEmpty icon={<BookOpen size={22}/>} title="Create a company first">Copilot answers are attached to the independent company you configure in Company Studio. <Link href="/studio" style={{color:"var(--gf-accent-2)"}}>Create a workspace</Link>.</GFEmpty>:<><div className="gf-chat" role="log" aria-live="polite" aria-relevant="additions">{messages.map(m=><div key={m.id} className={"gf-message "+m.role}><div className="gf-row" style={{marginBottom:8,fontSize:11,fontWeight:750,color:"var(--gf-accent-2)"}}>{m.role==="bot"?<Bot size={14}/>:<User size={14}/>} {m.role==="bot"?"GulfFlow":"You"} {m.mode&&<GFState tone={m.mode==="live"?"positive":"warning"}>{m.mode==="live"?"AI grounded":"Documentation search"}</GFState>}</div>{m.text}{m.sources&&m.sources.length>0&&<div className="gf-citations">{m.sources.map((s,i)=><span className="gf-citation" title={s.kind} key={s.id+"-"+i}>{s.title}</span>)}</div>}</div>)}{busy&&<div className="gf-message bot gf-row"><span className="gf-busy"/> Finding approved sources...</div>}<div ref={bottom}/></div>
    <form onSubmit={e=>void submit(e)} className="gf-chat-compose"><input className="gf-input" value={question} onChange={e=>setQuestion(e.target.value)} required maxLength={1200} placeholder="Ask about your company's operations..." aria-label="Ask Copilot"/><button className="gf-btn gf-btn-primary" disabled={busy||!question.trim()||!id} type="submit">{busy?<span className="gf-busy"/>:<Send size={17}/>} Send</button></form></>}
    {error&&<p className="gf-feedback error" role="alert" style={{marginTop:15}}>{error}</p>}
    </section>
    <aside className="gf-card"><div className="gf-row"><span className="gf-feature-icon" style={{margin:0}}><Sparkles size={19}/></span><h2>Built for real operations</h2></div><p className="gf-card-desc">This assistant looks up approved platform documentation, published company knowledge, and authorized company configuration.</p><div className="gf-divider"/>
      <h3>Suggested questions</h3><div style={{display:"grid",gap:9,marginTop:16}}>{suggestions.map(s=><button type="button" key={s} onClick={()=>choose(s)} className="gf-card-soft gf-between" style={{color:"var(--gf-text)",textAlign:"left",cursor:"pointer"}}><span style={{fontSize:12}}>{s}</span><ArrowRight size={15} color="var(--gf-accent-2)"/></button>)}</div>
      <div className="gf-info-strip" style={{marginTop:19}}><Info size={17}/><span>If a live model isn't configured, answers use a deterministic knowledge search. This assistant cannot silently send messages, run workflows, transfer payments or edit your company.</span></div>
      <div className="gf-divider"/>
      <div className="gf-row gf-muted"><ShieldCheck size={16} color="var(--gf-good)"/> User authentication and company membership required</div>
    </aside>
  </div>
 </GFShell>
}
