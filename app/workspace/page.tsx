"use client";
import Link from "next/link";
import {useCallback,useEffect,useMemo,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {ArrowRight,BookOpen,Bot,Boxes,Building2,CalendarDays,Check,CheckCircle2,ChevronDown,CircleAlert,ClipboardList,Database,FilePlus,FolderKanban,Globe2,Info,Layers3,Lock,LogOut,Plus,RefreshCw,Save,Settings2,ShieldCheck,Sparkles,Users,Workflow} from "lucide-react";
import {GFShell,GFEmpty,GFState} from "../../components/gf-shell";
import {ENTITY_TYPES,MODULES,UNIT_TYPES,type ModuleKey} from "../../lib/business-models";
import {getBrowserClient,explainSupabaseError} from "../../lib/supabase-browser";
type Company={id:string;name:string;industry:string;business_model:string;legal_structure:string;description:string;currency:string;locale:string;timezone:string;enabled_modules:string[]};
type Membership={business_id:string;role:string};
type Unit={id:string;name:string;kind:string;parent_id:string|null};
type RecordData={id:string;title:string;record_kind:string;status:string;properties:Record<string,unknown>;created_at:string};
type Field={id:string;entity_kind:string;field_key:string;label:string;field_type:string;required:boolean;options:unknown};
type Knowledge={id:string;question:string;answer:string;published:boolean;created_at:string};
type Flow={id:string;name:string;description:string;trigger_event:string;status:string;steps:unknown[]};
type Agent={id:string;name:string;purpose:string;instructions:string;status:string;language:string};
type Integr={id:string;provider:string;status:string;last_checked_at:string|null};
type Section="overview"|"records"|"structure"|"fields"|"knowledge"|"flows"|"agents"|"integrations"|"settings";
const nav:[Section,string][]=[["overview","Command Center"],["records","Custom Records"],["structure","Organization"],["fields","Data Studio"],["knowledge","Knowledge Base"],["flows","Flow Studio"],["agents","AI Agents"],["integrations","Integrations"],["settings","Settings"]];
export default function WorkspacePage(){
 const router=useRouter();
 const [currentUser,setCurrentUser]=useState<string|null>(null);
 const [companies,setCompanies]=useState<Company[]>([]);
 const [memberships,setMemberships]=useState<Membership[]>([]);
 const [activeId,setActiveId]=useState("");
 const [section,setSection]=useState<Section>("overview");
 const [loading,setLoading]=useState(true);
 const [detailsLoading,setDetailsLoading]=useState(false);
 const [saving,setSaving]=useState(false);
 const [message,setMessage]=useState("");
 const [isError,setIsError]=useState(false);
 const [units,setUnits]=useState<Unit[]>([]);
 const [records,setRecords]=useState<RecordData[]>([]);
 const [fields,setFields]=useState<Field[]>([]);
 const [knowledge,setKnowledge]=useState<Knowledge[]>([]);
 const [flows,setFlows]=useState<Flow[]>([]);
 const [agents,setAgents]=useState<Agent[]>([]);
 const [integrations,setIntegrations]=useState<Integr[]>([]);
 const [kind,setKind]=useState("customer");
 const [customKind,setCustomKind]=useState("");
 const [recordTitle,setRecordTitle]=useState("");
 const [recordStatus,setRecordStatus]=useState("new");
 const [props,setProps]=useState<Record<string,string>>({});
 const [unitName,setUnitName]=useState("");
 const [unitType,setUnitType]=useState("department");
 const [parentId,setParentId]=useState("");
 const [fieldEntity,setFieldEntity]=useState("customer");
 const [fieldName,setFieldName]=useState("");
 const [fieldType,setFieldType]=useState("text");
 const [fieldRequired,setFieldRequired]=useState(false);
 const [kbQuestion,setKbQuestion]=useState("");
 const [kbAnswer,setKbAnswer]=useState("");
 const [workflowName,setWorkflowName]=useState("");
 const [workflowTrigger,setWorkflowTrigger]=useState("lead.created");
 const [agentName,setAgentName]=useState("");
 const [agentPurpose,setAgentPurpose]=useState("Customer support");
 const [agentInstructions,setAgentInstructions]=useState("");
 const [companyDescription,setCompanyDescription]=useState("");
 const [customModules,setCustomModules]=useState<string[]>([]);
 const selected=companies.find(c=>c.id===activeId)||null;
 const myRole=memberships.find(m=>m.business_id===activeId)?.role||"viewer";
 const isAdmin=myRole==="owner"||myRole==="manager";
 const canEdit=myRole!=="viewer";
 const activeKind=kind==="custom"?(customKind.trim().toLowerCase().replace(/[^a-z0-9_]/g,"_")||"custom"):kind;
 const selectedFields=useMemo(()=>fields.filter(f=>f.entity_kind===activeKind),[fields,activeKind]);
 function report(msg:string,error=false){setMessage(msg);setIsError(error)}
 const fetchCompanies=useCallback(async()=>{
  const db=getBrowserClient();if(!db){report("Supabase environment not configured",true);setLoading(false);return}
  const {data:{user},error:authError}=await db.auth.getUser();
  if(authError||!user){setCurrentUser(null);setLoading(false);return}
  setCurrentUser(user.id);
  const {data:members,error}=await db.from("business_memberships").select("business_id,role");
  if(error){report(explainSupabaseError(error),true);setLoading(false);return}
  const ms=members as Membership[]||[];setMemberships(ms);
  if(ms.length===0){setCompanies([]);setLoading(false);return}
  const ids=ms.map(x=>x.business_id);
  const {data:cs,error:compError}=await db.from("businesses")
   .select("id,name,industry,business_model,legal_structure,description,currency,locale,timezone,enabled_modules")
   .in("id",ids);
  if(compError){report(explainSupabaseError(compError),true);setLoading(false);return}
  const all=cs as Company[]||[];
  setCompanies(all);
  const desired=new URLSearchParams(window.location.search).get("business");
  setActiveId(v=>all.some(x=>x.id===v)?v:desired&&all.some(x=>x.id===desired)?desired:all[0]?.id||"");
  setLoading(false);
 },[]);
 const fetchDetails=useCallback(async(id:string)=>{
  if(!id)return;
  const db=getBrowserClient();if(!db)return;
  setDetailsLoading(true);
  const queries=[
   db.from("business_units").select("id,name,kind,parent_id").eq("business_id",id).order("created_at",{ascending:true}).limit(250),
   db.from("business_records").select("id,title,record_kind,status,properties,created_at").eq("business_id",id).order("created_at",{ascending:false}).limit(150),
   db.from("custom_fields").select("id,entity_kind,field_key,label,field_type,required,options").eq("business_id",id).order("created_at",{ascending:true}).limit(200),
   db.from("knowledge_entries").select("id,question,answer,published,created_at").eq("business_id",id).order("created_at",{ascending:false}).limit(120),
   db.from("workflow_definitions").select("id,name,description,trigger_event,status,steps").eq("business_id",id).order("created_at",{ascending:false}).limit(80),
   db.from("ai_agents").select("id,name,purpose,instructions,status,language").eq("business_id",id).order("created_at",{ascending:false}).limit(80),
   db.from("integration_registry").select("id,provider,status,last_checked_at").eq("business_id",id).limit(50)
  ];
  const result=await Promise.all(queries);
  const errors=result.filter(v=>v.error).map(v=>v.error?.message);
  if(errors.length)report(explainSupabaseError(errors[0]),true);
  else report("");
  setUnits((result[0].data||[]) as Unit[]);
  setRecords((result[1].data||[]) as RecordData[]);
  setFields((result[2].data||[]) as Field[]);
  setKnowledge((result[3].data||[]) as Knowledge[]);
  setFlows((result[4].data||[]) as Flow[]);
  setAgents((result[5].data||[]) as Agent[]);
  setIntegrations((result[6].data||[]) as Integr[]);
  setDetailsLoading(false);
 },[]);
 useEffect(()=>{void fetchCompanies()},[fetchCompanies]);
 useEffect(()=>{if(activeId){const company=companies.find(c=>c.id===activeId);setCompanyDescription(company?.description||"");setCustomModules(company?.enabled_modules||[]);void fetchDetails(activeId)}},[activeId,fetchDetails,companies]);
 async function action(fn:()=>Promise<{error?:{message:string}|null}|void>,success:string){
  setSaving(true);report("");
  try{const r=await fn();if(r&&"error"in r&&r.error){report(explainSupabaseError(r.error),true)}else{report(success);await fetchDetails(activeId)}}catch(e){report(explainSupabaseError(e),true)}finally{setSaving(false)}
 }
 async function createRecord(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db||!currentUser||!selected)return;
  if(!/^[a-z][a-z0-9_]{1,79}$/.test(activeKind)){report("Entity type must start with a letter and use lowercase letters, numbers or underscores.",true);return}
  const extra:Record<string,string>={};
  for(const f of selectedFields){const value=props[f.field_key]?.trim()||"";if(f.required&&!value){report("Complete the required field: "+f.label,true);return}if(value)extra[f.field_key]=value}
  await action(async()=>{const {error}=await db.from("business_records").insert({business_id:activeId,record_kind:activeKind,title:recordTitle.trim(),status:recordStatus.trim()||"new",properties:extra,created_by:currentUser});if(!error){setRecordTitle("");setProps({})}return {error}},"Record created in the company database.");
 }
 async function createUnit(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  await action(async()=>{const {error}=await db.from("business_units").insert({business_id:activeId,name:unitName.trim(),kind:unitType,parent_id:parentId||null});if(!error)setUnitName("");return {error}},"Organization unit created.");
 }
 async function createField(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  const field_key=fieldName.trim().toLowerCase().replace(/[^a-z0-9]+/g,"_").replace(/^_+|_+$/g,"");
  if(!/^[a-z][a-z0-9_]{1,63}$/.test(field_key)){report("Field name must form a key with at least two letters.",true);return}
  await action(async()=>{const {error}=await db.from("custom_fields").insert({business_id:activeId,entity_kind:fieldEntity,field_key,label:fieldName.trim(),field_type:fieldType,required:fieldRequired});if(!error)setFieldName("");return {error}},"Custom field added. This field now appears on matching record forms.");
 }
 async function createKnowledge(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  await action(async()=>{const {error}=await db.from("knowledge_entries").insert({business_id:activeId,question:kbQuestion.trim(),answer:kbAnswer.trim(),published:false});if(!error){setKbQuestion("");setKbAnswer("")}return {error}},"Knowledge entry saved as draft. Publish it before AI may use it.");
 }
 async function togglePublished(k:Knowledge){const db=getBrowserClient();if(!db)return;await action(async()=>{
  const {error}=await db.from("knowledge_entries").update({published:!k.published}).eq("id",k.id).eq("business_id",activeId);return {error};
 },k.published?"Entry unpublished; AI cannot retrieve it.":"Entry published for authorized assistant retrieval.");}
 async function createFlow(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  await action(async()=>{const {error}=await db.from("workflow_definitions").insert({business_id:activeId,name:workflowName.trim(),trigger_event:workflowTrigger.trim(),description:"Designed in GulfFlow Flow Studio",status:"draft",steps:[]});if(!error)setWorkflowName("");return {error}},"Workflow definition saved. Execution is not connected yet.");
 }
 async function createAgent(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  await action(async()=>{const {error}=await db.from("ai_agents").insert({business_id:activeId,name:agentName.trim(),purpose:agentPurpose.trim(),instructions:agentInstructions.trim(),status:"draft",approval_required:true,language:selected?.locale||"en"});if(!error){setAgentName("");setAgentInstructions("")}return {error}},"AI agent profile saved as a draft.");
 }
 async function saveSettings(e:FormEvent){e.preventDefault();const db=getBrowserClient();if(!db)return;
  setSaving(true);report("");
  const {error}=await db.from("businesses").update({description:companyDescription.trim().slice(0,1000),enabled_modules:customModules}).eq("id",activeId);
  if(error)report(explainSupabaseError(error),true);else{report("Company settings updated successfully.");setCompanies(v=>v.map(c=>c.id===activeId?{...c,description:companyDescription,enabled_modules:customModules}:c))}
  setSaving(false);
 }
 async function logout(){const db=getBrowserClient();await db?.auth.signOut();router.replace("/sign-in")}
 return <GFShell eyebrow="WORKSPACE · CONNECTED BUSINESS DATA" title="Business Control Center" description="Manage every company independently, with custom entities, AI knowledge, workflows and organization structures." aside={currentUser?<button className="gf-btn gf-btn-secondary" onClick={()=>void logout()}><LogOut size={16}/> Sign out</button>:<Link href="/sign-in" className="gf-btn gf-btn-primary">Sign in <ArrowRight size={16}/></Link>}>
  {loading?<div className="gf-card gf-row" style={{justifyContent:"center",padding:85}}><span className="gf-busy"/> Loading your companies...</div>:!currentUser?<div className="gf-card"><GFEmpty icon={<Lock size={24}/>} title="Your account is required">Sign in to access your own companies. No business data is available without authentication.</GFEmpty><div className="gf-row" style={{justifyContent:"center",marginTop:22}}><Link className="gf-btn gf-btn-primary" href="/sign-in">Sign in to GulfFlow <ArrowRight size={16}/></Link></div></div>:companies.length===0?<div className="gf-card"><GFEmpty icon={<Building2 size={26}/>} title="Your business empire starts here">You haven't created a GulfFlow company yet. Each workspace is independently configurable for any industry or organization structure.</GFEmpty><div className="gf-row" style={{justifyContent:"center",marginTop:24}}><Link className="gf-btn gf-btn-primary" href="/studio">Create first company <Plus size={16}/></Link></div></div>:<>
   <div className="gf-card" style={{marginBottom:21,padding:19}}>
    <div className="gf-between" style={{flexWrap:"wrap"}}>
     <div className="gf-row"><span className="gf-feature-icon" style={{margin:0}}><Building2 size={21}/></span><div><div className="gf-small-caps" style={{marginBottom:7}}>ACTIVE COMPANY</div><select className="gf-select" value={activeId} onChange={e=>{setActiveId(e.target.value);setSection("overview")}} aria-label="Select company" style={{minWidth:220,maxWidth:350,fontWeight:750}}>{companies.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select></div></div>
     <div className="gf-row" style={{flexWrap:"wrap"}}><GFState tone="positive">{myRole.toUpperCase()}</GFState><GFState>{selected?.business_model||"Custom"}</GFState><Link className="gf-btn gf-btn-secondary" href="/studio"><Plus size={16}/> New company</Link></div>
    </div>
   </div>
   <div className="gf-tabs" role="tablist" aria-label="Workspace modules">{nav.map(([key,label])=><button role="tab" aria-selected={section===key} key={key} onClick={()=>{setSection(key);report("")}} className={"gf-tab "+(section===key?"gf-selected":"")}>{label}</button>)}</div>
   {detailsLoading&&<div className="gf-row gf-muted" style={{marginBottom:15}}><span className="gf-busy"/> Syncing company records...</div>}
   {message&&<div className={"gf-feedback "+(isError?"error":"success")} role="status" style={{marginBottom:20}}>{message}</div>}
   {section==="overview"&&<div>
     <div className="gf-grid-4">{[[records.length,"Custom records","Records in this company",Database],[units.length,"Org units","Branches and departments",Building2],[knowledge.filter(x=>x.published).length,"Published knowledge","Approved for retrieval",BookOpen],[flows.length,"Workflow designs","Execution not yet configured",Workflow]].map(([number,label,detail,Icon])=>{const I=Icon as typeof Database;return <div className="gf-card gf-metric" key={label as string}><div className="gf-between"><span>{label as string}</span><I size={20} color="var(--gf-accent-2)"/></div><strong>{number as number}</strong><small>{detail as string}</small></div>})}</div>
     <div className="gf-grid-2" style={{marginTop:19}}>
      <section className="gf-card"><div className="gf-between"><div><h2>{selected?.name}</h2><p className="gf-card-desc">{selected?.description||"Your independently configured company operating space."}</p></div><ShieldCheck size={25} color="var(--gf-good)"/></div><div className="gf-divider"/><div className="gf-tag-list">{(selected?.enabled_modules||[]).map(m=><GFState key={m}>{MODULES.find(x=>x.key===m)?.label||m}</GFState>)}</div><div className="gf-divider"/><div className="gf-between gf-muted"><span>Currency: {selected?.currency}</span><span>Timezone: {selected?.timezone}</span></div></section>
      <section className="gf-card"><div className="gf-between"><div><h2>Company intelligence</h2><p className="gf-card-desc">Answers grounded in the selected company's knowledge and platform documentation.</p></div><Bot size={23} color="var(--gf-accent-2)"/></div><div className="gf-card-soft" style={{marginTop:18}}><div className="gf-row"><Sparkles size={19} color="var(--gf-accent-2)"/><strong>GulfFlow Copilot</strong></div><p className="gf-card-desc">Explore your company architecture, available modules, knowledge and approved actions. A live AI model is optional.</p><Link href={"/copilot?business="+encodeURIComponent(activeId)} className="gf-btn gf-btn-primary">Open company Copilot <ArrowRight size={16}/></Link></div></section>
     </div>
     <div className="gf-card" style={{marginTop:18}}><div className="gf-between"><div><h2>Your latest records</h2><p className="gf-card-desc">Real records, returned under your company's database access policies.</p></div><button className="gf-btn gf-btn-quiet" onClick={()=>setSection("records")}>View records <ArrowRight size={16}/></button></div><div style={{overflowX:"auto",marginTop:15}}><table className="gf-list-table"><thead><tr><th>Record</th><th>Type</th><th>Status</th><th>Created</th></tr></thead><tbody>{records.slice(0,5).map(r=><tr key={r.id}><td>{r.title}</td><td>{r.record_kind}</td><td><GFState>{r.status}</GFState></td><td>{new Date(r.created_at).toLocaleDateString("en")}</td></tr>)}{records.length===0&&<tr><td colSpan={4}>No records yet. Create one in Custom Records.</td></tr>}</tbody></table></div></div>
    </div>}
   {section==="records"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><div className="gf-between"><h2>Custom records</h2><GFState>{records.length} total</GFState></div><p className="gf-card-desc">Build any data model: customers, projects, products, cases, assets or a category you invent.</p><div style={{overflowX:"auto",marginTop:20}}><table className="gf-list-table"><thead><tr><th>Record</th><th>Entity</th><th>Status</th></tr></thead><tbody>{records.map(r=><tr key={r.id}><td><b>{r.title}</b>{Object.entries(r.properties||{}).length>0&&<div className="gf-muted">{Object.entries(r.properties).slice(0,2).map(([k,v])=>k+": "+String(v)).join(" · ")}</div>}</td><td>{r.record_kind}</td><td><GFState>{r.status}</GFState></td></tr>)}{!records.length&&<tr><td colSpan={3}>No records in this company yet.</td></tr>}</tbody></table></div></section>
    <section className="gf-card"><h2>Create a record</h2><p className="gf-card-desc">All data belongs to {selected?.name} and follows company-level RLS.</p><form className="gf-form" style={{marginTop:21}} onSubmit={e=>void createRecord(e)}>
      <label className="gf-field"><span>Entity type</span><select className="gf-select" value={kind} onChange={e=>{setKind(e.target.value);setProps({})}}>{ENTITY_TYPES.map(k=><option key={k} value={k}>{k.replace(/_/g," ").replace(/^./,s=>s.toUpperCase())}</option>)}</select></label>
      {kind==="custom"&&<label className="gf-field"><span>Custom entity key</span><input className="gf-input" value={customKind} onChange={e=>setCustomKind(e.target.value)} placeholder="e.g. vehicle_inspection" maxLength={80}/></label>}
      <label className="gf-field"><span>Record name</span><input className="gf-input" required minLength={2} maxLength={200} value={recordTitle} onChange={e=>setRecordTitle(e.target.value)} placeholder="e.g. Project Apollo"/></label>
      <label className="gf-field"><span>Status</span><input className="gf-input" value={recordStatus} maxLength={60} onChange={e=>setRecordStatus(e.target.value)} placeholder="new"/></label>
      {selectedFields.map(f=><label className="gf-field" key={f.id}><span>{f.label}{f.required?" *":""}</span><input className="gf-input" required={f.required} type={f.field_type==="number"||f.field_type==="currency"?"number":f.field_type==="email"?"email":f.field_type==="date"?"date":"text"} value={props[f.field_key]||""} onChange={e=>setProps(v=>({...v,[f.field_key]:e.target.value}))}/></label>)}
      {selectedFields.length===0&&<div className="gf-info-strip"><Info size={16}/><span>No custom fields for this entity. Use Data Studio to define fields for your company's record types.</span></div>}
      <button className="gf-btn gf-btn-primary" disabled={saving||!canEdit||!recordTitle.trim()} type="submit"><Plus size={17}/> Save record</button>
    </form></section>
   </div>}
   {section==="structure"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><h2>Company organization</h2><p className="gf-card-desc">Create branches, divisions, subsidiaries, franchises, teams and nested reporting structures.</p>
      <div style={{display:"grid",gap:10,marginTop:20}}>{units.map(u=><div key={u.id} className="gf-card-soft gf-between"><div className="gf-row"><span className="gf-feature-icon" style={{margin:0,height:35,width:35}}><Building2 size={17}/></span><div><strong style={{fontSize:13}}>{u.name}</strong><div className="gf-muted">{u.kind.replace("_"," ")}{u.parent_id?" · Within "+(units.find(p=>p.id===u.parent_id)?.name||"unit"):""}</div></div></div></div>)}{units.length===0&&<GFEmpty title="No units configured">Add your first department, branch or organizational unit.</GFEmpty>}</div>
    </section>
    <section className="gf-card"><h2>Add organizational unit</h2><p className="gf-card-desc">Units are scoped to this company. Parent units must belong to the same company.</p><form className="gf-form" onSubmit={e=>void createUnit(e)} style={{marginTop:20}}>
      <label className="gf-field"><span>Name</span><input className="gf-input" value={unitName} onChange={e=>setUnitName(e.target.value)} required minLength={2} maxLength={120} placeholder="e.g. Doha Branch"/></label>
      <label className="gf-field"><span>Unit type</span><select className="gf-select" value={unitType} onChange={e=>setUnitType(e.target.value)}>{UNIT_TYPES.map(t=><option value={t} key={t}>{t.replace(/_/g," ").replace(/^./,x=>x.toUpperCase())}</option>)}</select></label>
      <label className="gf-field"><span>Parent (optional)</span><select className="gf-select" value={parentId} onChange={e=>setParentId(e.target.value)}><option value="">Top level</option>{units.map(u=><option value={u.id} key={u.id}>{u.name}</option>)}</select></label>
      <button className="gf-btn gf-btn-primary" type="submit" disabled={saving||!isAdmin}><Plus size={16}/> Add unit</button>
    </form></section>
   </div>}
   {section==="fields"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><h2>Company data schema</h2><p className="gf-card-desc">Define custom fields independently for any entity type. No code or new database tables needed.</p><div style={{display:"grid",gap:10,marginTop:20}}>{fields.map(f=><div key={f.id} className="gf-card-soft gf-between"><div><strong>{f.label}</strong><div className="gf-muted">{f.entity_kind} · {f.field_key} · {f.field_type}</div></div>{f.required&&<GFState>Required</GFState>}</div>)}{!fields.length&&<GFEmpty icon={<Database size={22}/>} title="Schema is completely yours">Create custom fields for customers, shipments, properties, cases, products—or anything else.</GFEmpty>}</div></section>
    <section className="gf-card"><h2>Add custom field</h2><p className="gf-card-desc">New fields appear immediately when you create records of that entity type.</p><form className="gf-form" style={{marginTop:20}} onSubmit={e=>void createField(e)}>
      <label className="gf-field"><span>Entity type</span><input className="gf-input" required value={fieldEntity} maxLength={80} onChange={e=>setFieldEntity(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g,"_"))} placeholder="customer"/></label>
      <label className="gf-field"><span>Field label</span><input className="gf-input" required minLength={2} maxLength={120} value={fieldName} onChange={e=>setFieldName(e.target.value)} placeholder="e.g. Preferred service"/></label>
      <label className="gf-field"><span>Data type</span><select className="gf-select" value={fieldType} onChange={e=>setFieldType(e.target.value)}>{["text","long_text","number","currency","date","datetime","boolean","select","email","phone","url"].map(x=><option value={x} key={x}>{x.replace("_"," ")}</option>)}</select></label>
      <label className="gf-choice"><input type="checkbox" checked={fieldRequired} onChange={e=>setFieldRequired(e.target.checked)}/><span>Required when adding records</span></label>
      <button type="submit" className="gf-btn gf-btn-primary" disabled={saving||!isAdmin}><Plus size={16}/> Add schema field</button>
    </form></section>
   </div>}
   {section==="knowledge"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><div className="gf-between"><h2>Approved company knowledge</h2><GFState tone="positive">{knowledge.filter(k=>k.published).length} published</GFState></div><p className="gf-card-desc">Only published entries may be used by the assistant. Each company has its own content.</p><div style={{display:"grid",gap:13,marginTop:20}}>{knowledge.map(k=><div key={k.id} className="gf-card-soft"><div className="gf-between"><strong style={{fontSize:13}}>{k.question}</strong><GFState tone={k.published?"positive":"warning"}>{k.published?"Published":"Draft"}</GFState></div><p className="gf-card-desc gf-long-text">{k.answer}</p>{isAdmin&&<button type="button" disabled={saving} className="gf-btn gf-btn-secondary" onClick={()=>void togglePublished(k)}>{k.published?"Unpublish":"Approve & publish"}</button>}</div>)}{knowledge.length===0&&<GFEmpty title="No knowledge entries yet">Add your company policies, service descriptions and FAQ responses. Approve them before AI retrieval.</GFEmpty>}</div></section>
    <section className="gf-card"><h2>New knowledge entry</h2><form className="gf-form" onSubmit={e=>void createKnowledge(e)} style={{marginTop:20}}>
      <label className="gf-field"><span>Customer / employee question</span><input className="gf-input" value={kbQuestion} onChange={e=>setKbQuestion(e.target.value)} required minLength={5} maxLength={500} placeholder="e.g. What is your refund policy?"/></label>
      <label className="gf-field"><span>Approved company answer</span><textarea className="gf-textarea" rows={7} maxLength={5000} required minLength={10} value={kbAnswer} onChange={e=>setKbAnswer(e.target.value)} placeholder="Write the correct response and any restrictions..."/></label>
      <button type="submit" disabled={saving||!isAdmin} className="gf-btn gf-btn-primary"><Save size={16}/> Save as draft</button>
    </form><div className="gf-info-strip" style={{marginTop:16}}><ShieldCheck size={16}/><span>AI access to drafts is denied. Publishing is controlled by company owners or managers.</span></div></section>
   </div>}
   {section==="flows"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><h2>Workflow library</h2><p className="gf-card-desc">Design workflows that match your own operations, then connect execution adapters when ready.</p><div style={{display:"grid",gap:12,marginTop:20}}>{flows.map(f=><div key={f.id} className="gf-card-soft gf-between"><div><strong>{f.name}</strong><p className="gf-card-desc">Trigger: {f.trigger_event} · {Array.isArray(f.steps)?f.steps.length:0} configured steps</p></div><GFState tone="warning">{f.status==="active"?"Defined (execution not verified)":f.status}</GFState></div>)}{flows.length===0&&<GFEmpty icon={<Workflow size={23}/>} title="Start with a workflow design">For example, trigger on a new lead and define staff-assignment steps. Execution is a separate deployment stage.</GFEmpty>}</div></section>
    <section className="gf-card"><h2>Create workflow design</h2><p className="gf-card-desc">Definitions are saved in the database as drafts. This screen does not trigger emails, messages or external actions yet.</p><form className="gf-form" style={{marginTop:20}} onSubmit={e=>void createFlow(e)}>
     <label className="gf-field"><span>Workflow name</span><input className="gf-input" value={workflowName} onChange={e=>setWorkflowName(e.target.value)} required minLength={2} maxLength={160} placeholder="e.g. New customer onboarding"/></label>
     <label className="gf-field"><span>Trigger event</span><select className="gf-select" value={workflowTrigger} onChange={e=>setWorkflowTrigger(e.target.value)}>{["lead.created","record.created","booking.requested","message.received","customer.updated","invoice.due","manual.trigger"].map(t=><option value={t} key={t}>{t}</option>)}</select></label>
     <button type="submit" disabled={saving||!isAdmin} className="gf-btn gf-btn-primary"><Plus size={16}/> Save workflow draft</button>
    </form></section>
   </div>}
   {section==="agents"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><h2>AI agent profiles</h2><p className="gf-card-desc">Configure distinct assistants for each company's business rules and departments.</p><div style={{display:"grid",gap:12,marginTop:20}}>{agents.map(a=><div className="gf-card-soft" key={a.id}><div className="gf-between"><strong>{a.name}</strong><GFState tone="warning">{a.status}</GFState></div><p className="gf-card-desc">{a.purpose}</p><div className="gf-muted gf-long-text">{a.instructions.slice(0,160)}{a.instructions.length>160?"...":""}</div></div>)}{agents.length===0&&<GFEmpty icon={<Bot size={22}/>} title="No AI agents configured">Create a receptionist, sales qualifier, operations helper or knowledge specialist.</GFEmpty>}</div>
    <div className="gf-info-strip" style={{marginTop:19}}><Info size={16}/><span>Agent profiles are definitions, not active autonomous agents. Live responses require a configured provider and approved tool permissions.</span></div></section>
    <section className="gf-card"><h2>Create assistant profile</h2><form className="gf-form" style={{marginTop:20}} onSubmit={e=>void createAgent(e)}>
      <label className="gf-field"><span>Assistant name</span><input className="gf-input" value={agentName} onChange={e=>setAgentName(e.target.value)} required minLength={2} maxLength={120} placeholder="e.g. Doha Receptionist"/></label>
      <label className="gf-field"><span>Purpose</span><input className="gf-input" value={agentPurpose} onChange={e=>setAgentPurpose(e.target.value)} maxLength={160} placeholder="Customer support"/></label>
      <label className="gf-field"><span>Instructions and restrictions</span><textarea className="gf-textarea" rows={7} value={agentInstructions} onChange={e=>setAgentInstructions(e.target.value)} maxLength={8000} placeholder="What this assistant is allowed to do, how it should communicate, and when to involve staff."/></label>
      <button type="submit" disabled={saving||!isAdmin} className="gf-btn gf-btn-primary"><Plus size={16}/> Save agent draft</button>
    </form></section>
   </div>}
   {section==="integrations"&&<div className="gf-card"><div className="gf-between"><div><h2>Integration center</h2><p className="gf-card-desc">Provider credentials require a verified connection flow. No credential values are stored in this UI.</p></div><ShieldCheck size={22} color="var(--gf-good)"/></div>
     <div className="gf-grid-3" style={{marginTop:20}}>{[["WhatsApp Business","Messages and approved templates"],["OpenAI","Grounded assistants and business Copilot"],["Email","Transactional customer communications"],["Calendar","Booking coordination and scheduling"],["Payments","Invoices and payment confirmation"],["n8n / Webhooks","Agency-owned workflow automation"]].map(([provider,description])=><div className="gf-card-soft" key={provider}><span className="gf-feature-icon"><Globe2 size={19}/></span><strong>{provider}</strong><p className="gf-card-desc">{description}</p><GFState tone="warning">{integrations.some(i=>i.provider===provider&&i.status==="connected")?"Connection metadata exists":"Not connected"}</GFState></div>)}</div>
     <div className="gf-info-strip" style={{marginTop:20}}><CircleAlert size={17}/><span>Integration cards are informational. We will only display a live connection after an OAuth/provider handshake and a successful health check.</span></div>
    </div>}
   {section==="settings"&&<div className="gf-grid-2" style={{alignItems:"start"}}>
    <section className="gf-card"><h2>Company settings</h2><p className="gf-card-desc">Change which modules this company uses without affecting any other business workspace.</p><form className="gf-form" style={{marginTop:18}} onSubmit={e=>void saveSettings(e)}>
      <label className="gf-field"><span>Description</span><textarea className="gf-textarea" rows={4} value={companyDescription} maxLength={1000} onChange={e=>setCompanyDescription(e.target.value)}/></label>
      <strong style={{fontSize:13}}>Enabled modules</strong>
      <div className="gf-grid-2" style={{gap:10}}>{MODULES.map(m=><label className="gf-choice" key={m.key}><input type="checkbox" disabled={!isAdmin} checked={customModules.includes(m.key)} onChange={e=>setCustomModules(v=>e.target.checked?[...v,m.key]:v.filter(s=>s!==m.key))}/><span>{m.label}</span></label>)}</div>
      <button type="submit" disabled={saving||!isAdmin} className="gf-btn gf-btn-primary"><Save size={16}/> Save company settings</button>
    </form></section>
    <section className="gf-card"><h2>Company identity</h2><div className="gf-summary-list">{[["Company ID",selected?.id||""],["Industry",selected?.industry||""],["Business model",selected?.business_model||""],["Structure",selected?.legal_structure||""],["My role",myRole],["Currency",selected?.currency||""],["Timezone",selected?.timezone||""]].map(([label,value])=><div className="gf-summary-row" key={label}><span>{label}</span><strong style={{overflowWrap:"anywhere"}}>{value}</strong></div>)}</div><div className="gf-info-strip" style={{marginTop:20}}><ShieldCheck size={17}/><span>Business records and company configuration are secured with Postgres Row Level Security. Administrative modifications require the owner's or manager's role.</span></div></section>
   </div>}
  </>}
 </GFShell>
}
