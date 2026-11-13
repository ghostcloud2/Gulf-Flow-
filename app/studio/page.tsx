"use client";
import Link from "next/link";
import {useEffect,useMemo,useState} from "react";
import {useRouter} from "next/navigation";
import {ArrowLeft,ArrowRight,Blocks,Building2,Check,CheckCircle2,ChevronRight,Compass,Globe2,Info,Layers3,Plus,Save,Search,ShieldCheck,Sparkles,Trash2,Workflow} from "lucide-react";
import {GFShell,GFState} from "../../components/gf-shell";
import {BUSINESS_MODELS,BUSINESS_TEMPLATES,DEFAULT_DRAFT,LEGAL_STRUCTURES,MODULES,fromTemplate,type CompanyDraft,type ModuleKey} from "../../lib/business-models";
import {explainSupabaseError,getBrowserClient,supabaseConfigured} from "../../lib/supabase-browser";
const steps=["Choose your model","Company structure","Build your toolkit","Review & launch"];
const displayDate=new Intl.DateTimeFormat("en",{month:"short",day:"numeric"});
export default function StudioPage(){
 const router=useRouter();
 const [step,setStep]=useState(0);
 const [draft,setDraft]=useState<CompanyDraft>(DEFAULT_DRAFT);
 const [template,setTemplate]=useState("services");
 const [filter,setFilter]=useState("");
 const [unitName,setUnitName]=useState("");
 const [auth,setAuth]=useState(false);
 const [saving,setSaving]=useState(false);
 const [feedback,setFeedback]=useState("");
 const [warn,setWarn]=useState(false);
 const [draftSaved,setDraftSaved]=useState(false);
 useEffect(()=>{
   try{const raw=localStorage.getItem("gf-company-draft-v1");if(raw){
    const parsed=JSON.parse(raw) as Partial<CompanyDraft>;
    setDraft(v=>({...v,...parsed,modules:Array.isArray(parsed.modules)?parsed.modules:v.modules,departments:Array.isArray(parsed.departments)?parsed.departments:v.departments}));
    setDraftSaved(true);
   }}catch{/* Invalid local draft ignored */}
   const db=getBrowserClient();if(!db)return;
   void db.auth.getUser().then(({data})=>setAuth(Boolean(data.user)));
   const {data:{subscription}}=db.auth.onAuthStateChange((_event,session)=>setAuth(Boolean(session?.user)));
   return ()=>subscription.unsubscribe();
 },[]);
 const activeTemplate=BUSINESS_TEMPLATES.find(t=>t.key===template)||BUSINESS_TEMPLATES[0];
 const matches=useMemo(()=>BUSINESS_TEMPLATES.filter(t=>(t.name+" "+t.description+" "+t.group).toLowerCase().includes(filter.toLowerCase())),[filter]);
 const update=<K extends keyof CompanyDraft>(key:K,value:CompanyDraft[K])=>{setDraft(v=>({...v,[key]:value}));setDraftSaved(false);setFeedback("")};
 function useTemplate(key:string){setTemplate(key);setDraft(v=>({...v,...fromTemplate(key)}));setDraftSaved(false)}
 function toggleModule(key:ModuleKey){update("modules",draft.modules.includes(key)?draft.modules.filter(m=>m!==key):[...draft.modules,key])}
 function saveDraft(){try{localStorage.setItem("gf-company-draft-v1",JSON.stringify(draft));setDraftSaved(true);setFeedback("Draft saved in this browser only. It is not yet a live company.");setWarn(false)}catch{setFeedback("Could not save the browser draft.");setWarn(true)}}
 function next(){if(step===1&&!draft.name.trim()){setFeedback("Enter a company name to continue.");setWarn(true);return}setFeedback("");setStep(v=>Math.min(3,v+1))}
 async function launch(){
  setSaving(true);setFeedback("");setWarn(false);
  const client=getBrowserClient();
  if(!client){setFeedback("Supabase is not configured. Configure your Vercel environment first.");setWarn(true);setSaving(false);return}
  const {data:{user},error:authError}=await client.auth.getUser();
  if(authError||!user){setFeedback("Sign in first. Your setup can be saved locally while you sign in.");setWarn(true);setSaving(false);return}
  if(draft.name.trim().length<2){setFeedback("Company name must have at least two characters.");setWarn(true);setSaving(false);return}
  const {data:id,error}=await client.rpc("create_business_workspace",{
   p_name:draft.name.trim(),p_industry:draft.industry,p_business_model:draft.businessModel,
   p_legal_structure:draft.legalStructure,p_modules:draft.modules,p_currency:draft.currency,
   p_timezone:draft.timezone,p_locale:draft.locale
  });
  if(error){setFeedback(explainSupabaseError(error));setWarn(true);setSaving(false);return}
  if(!id){setFeedback("Company creation did not return an ID.");setWarn(true);setSaving(false);return}
  const companyId=String(id);
  if(draft.description.trim()){
   await client.from("businesses").update({description:draft.description.trim().slice(0,1000)}).eq("id",companyId);
  }
  const units=draft.departments.map(name=>({business_id:companyId,name,kind:"department"}));
  if(units.length){const {error:unitsError}=await client.from("business_units").insert(units);
   if(unitsError){setFeedback("Company created, but some departments could not be saved: "+explainSupabaseError(unitsError));setWarn(true);setSaving(false);return}
  }
  localStorage.removeItem("gf-company-draft-v1");
  router.push("/workspace?business="+encodeURIComponent(companyId));
 }
 return <GFShell eyebrow="YOUR OPERATING SYSTEM · YOUR RULES" title="Company Studio" description="Design a completely independent operating model for any organization. Choose a template or start from zero—every department, module and workflow is yours to shape." aside={<GFState tone={auth?"positive":"warning"}>{auth?"Signed in · Ready to configure":"Browser draft mode"}</GFState>}>
  <div className="gf-info-strip"><Info size={18}/><div>One GulfFlow account can manage multiple independent companies. Every company maintains its own data, structure, permissions and knowledge. <strong>Industry templates are suggestions, never restrictions.</strong></div></div>
  <div className="gf-steps">{steps.map((item,i)=><button key={item} type="button" className={"gf-step "+(i===step?"gf-step-active":"")} onClick={()=>{if(i<step||draft.name.trim()||i<=1){setStep(i);setFeedback("")}}}><b>{i<step?<Check size={13}/>:i+1}</b>{item}</button>)}</div>
  {step===0&&<div className="gf-card">
    <div className="gf-between" style={{marginBottom:22,flexWrap:"wrap"}}><div><h2>Choose a starting point</h2><p className="gf-card-desc">Every template is fully editable. Your company can combine modules from multiple industries.</p></div><label className="gf-row" style={{border:"1px solid var(--gf-line)",borderRadius:12,padding:"0 12px"}}><Search size={16}/><input className="gf-input" style={{border:0,background:"none",width:190}} value={filter} onChange={e=>setFilter(e.target.value)} placeholder="Search industries..." aria-label="Search industry templates"/></label></div>
    <div className="gf-template-grid">{matches.map(t=><button type="button" key={t.key} className={"gf-template "+(template===t.key?"gf-chosen":"")} onClick={()=>useTemplate(t.key)}><GFState>{t.group}</GFState><strong>{t.name}</strong><small>{t.description}</small>{template===t.key&&<CheckCircle2 style={{position:"absolute",right:15,top:15,color:"var(--gf-accent-2)"}} size={19}/>}</button>)}</div>
    {matches.length===0&&<p className="gf-muted">No matching industry template. Select “Build from scratch” to configure any other business.</p>}
    <div className="gf-divider"/>
    <div className="gf-grid-2"><div className="gf-card-soft"><div className="gf-row"><Compass size={20} color="var(--gf-accent-2)"/><b>Not limited by templates</b></div><p className="gf-card-desc">Add custom record types, company units, fields and workflows after launch.</p></div><div className="gf-card-soft"><div className="gf-row"><ShieldCheck size={20} color="var(--gf-accent-2)"/><b>Independent by design</b></div><p className="gf-card-desc">Your company's records and approved AI knowledge remain separated by database permissions.</p></div></div>
  </div>}
  {step===1&&<div className="gf-grid-2" style={{alignItems:"start"}}>
   <section className="gf-card"><h2>Company identity</h2><p className="gf-card-desc">Set the operating model. None of these classifications restrict the modules you can activate.</p>
    <div className="gf-form" style={{marginTop:24}}>
      <label className="gf-field"><span>Company / organization name *</span><input className="gf-input" maxLength={120} value={draft.name} onChange={e=>update("name",e.target.value)} placeholder="e.g. Horizon Group Qatar"/></label>
      <label className="gf-field"><span>What does the business do?</span><textarea className="gf-textarea" value={draft.description} maxLength={1000} onChange={e=>update("description",e.target.value)} placeholder="Describe your company, departments and the work you want GulfFlow to handle."/></label>
      <label className="gf-field"><span>Business model</span><select className="gf-select" value={draft.businessModel} onChange={e=>update("businessModel",e.target.value)}>{BUSINESS_MODELS.map(x=><option value={x.key} key={x.key}>{x.label}</option>)}</select></label>
      <label className="gf-field"><span>Company structure</span><select className="gf-select" value={draft.legalStructure} onChange={e=>update("legalStructure",e.target.value)}>{LEGAL_STRUCTURES.map(x=><option value={x.key} key={x.key}>{x.label}</option>)}</select></label>
      <div className="gf-form-grid"><label className="gf-field"><span>Default currency</span><select className="gf-select" value={draft.currency} onChange={e=>update("currency",e.target.value)}>{["QAR","AED","SAR","KWD","BHD","OMR","USD","EUR","GBP","KES"].map(x=><option key={x}>{x}</option>)}</select></label><label className="gf-field"><span>Interface language</span><select className="gf-select" value={draft.locale} onChange={e=>update("locale",e.target.value)}><option value="en">English</option><option value="ar">Arabic (language setting)</option></select></label></div>
      <label className="gf-field"><span>Business timezone</span><select className="gf-select" value={draft.timezone} onChange={e=>update("timezone",e.target.value)}>{["Asia/Qatar","Asia/Dubai","Asia/Riyadh","Asia/Kuwait","Asia/Bahrain","Asia/Muscat","Africa/Nairobi","Europe/London","UTC"].map(x=><option key={x}>{x}</option>)}</select></label>
    </div>
   </section>
   <section className="gf-card"><div className="gf-between"><div><h2>Company departments</h2><p className="gf-card-desc">Start with teams; add branches, divisions and franchises after launch.</p></div><Building2 size={22} color="var(--gf-accent-2)"/></div>
    <div className="gf-form" style={{marginTop:23}}>{draft.departments.map((name,i)=><div className="gf-card-soft gf-between" key={i}><div className="gf-row"><span className="gf-feature-icon" style={{height:32,width:32,margin:0,borderRadius:10}}><Building2 size={16}/></span><span style={{fontSize:13}}>{name}</span></div><button aria-label={"Remove "+name} title={"Remove "+name} className="gf-btn gf-btn-quiet" type="button" onClick={()=>update("departments",draft.departments.filter((_,j)=>j!==i))}><Trash2 size={16}/></button></div>)}
      <form onSubmit={e=>{e.preventDefault();if(unitName.trim().length>=2&&!draft.departments.includes(unitName.trim())){update("departments",[...draft.departments,unitName.trim()]);setUnitName("")}}} className="gf-row"><input className="gf-input" maxLength={120} value={unitName} onChange={e=>setUnitName(e.target.value)} placeholder="New department / team" aria-label="New department"/><button className="gf-btn gf-btn-secondary" type="submit" disabled={unitName.trim().length<2}><Plus size={17}/></button></form>
      <p className="gf-card-desc">You can create unlimited nested organizational units later. Your organizational layout does not have to match the industry template.</p>
    </div>
   </section>
  </div>}
  {step===2&&<div className="gf-card"><div className="gf-between" style={{flexWrap:"wrap",marginBottom:22}}><div><h2>Pick your business tools</h2><p className="gf-card-desc">Mix and match across industries. Change the selected modules at any time.</p></div><GFState tone="positive">{draft.modules.length} modules selected</GFState></div><div className="gf-module-grid">{MODULES.map(m=><label key={m.key} className={"gf-module "+(draft.modules.includes(m.key)?"gf-chosen":"")}><input type="checkbox" checked={draft.modules.includes(m.key)} onChange={()=>toggleModule(m.key)}/><span><strong>{m.label}</strong><small>{m.description}</small></span></label>)}</div><div className="gf-divider"/><h3>Suggested workflow designs for {activeTemplate.name}</h3><p className="gf-card-desc">These are suggestions for later setup, not live automations.</p><div className="gf-flow-line" style={{marginTop:15}}>{activeTemplate.workflows.length?activeTemplate.workflows.map((w,i)=><span className="gf-flow-pill" key={i}><Workflow size={13} style={{verticalAlign:"middle",marginRight:7}}/>{w}</span>):<span className="gf-muted">Start with a completely blank workflow library.</span>}</div></div>}
  {step===3&&<div className="gf-grid-2" style={{alignItems:"start"}}>
   <section className="gf-card"><h2>Ready for your company</h2><p className="gf-card-desc">Review the configuration before creating your own isolated business workspace in Supabase.</p>
    <div className="gf-summary-list" style={{marginTop:19}}>
      {[["Company",draft.name||"Not set"],["Business model",BUSINESS_MODELS.find(x=>x.key===draft.businessModel)?.label||draft.businessModel],["Structure",LEGAL_STRUCTURES.find(x=>x.key===draft.legalStructure)?.label||draft.legalStructure],["Currency",draft.currency],["Timezone",draft.timezone],["Departments",String(draft.departments.length)],["Modules",String(draft.modules.length)]].map(([a,b])=><div className="gf-summary-row" key={a}><span>{a}</span><strong>{b}</strong></div>)}
    </div>
    <div className="gf-tag-list" style={{marginTop:20}}>{draft.modules.map(key=><GFState key={key}>{MODULES.find(m=>m.key===key)?.label||key}</GFState>)}</div>
   </section>
   <section className="gf-card"><div className="gf-feature-icon"><Sparkles size={22}/></div><h2>Create your operating space</h2><p className="gf-card-desc">This creates a real company with your signed-in user as owner. Departments are saved as separate records. Workflows and AI are configured later.</p>
    <div className="gf-info-strip" style={{marginTop:19}}><ShieldCheck size={18}/><span>No cross-company data sharing. Each company has its own settings, access control, knowledge, records and agents.</span></div>
    {!auth&&<div className="gf-feedback"><strong>Sign-in required to launch.</strong> Save a local draft, then sign in to create your company securely.<div style={{marginTop:12}}><Link className="gf-btn gf-btn-secondary" href="/sign-in">Sign in / create account <ChevronRight size={16}/></Link></div></div>}
    {auth&&<button type="button" disabled={saving||!draft.name.trim()||!supabaseConfigured()} onClick={()=>void launch()} className="gf-btn gf-btn-primary" style={{marginTop:17,width:"100%"}}>{saving?<span className="gf-busy"/>:<CheckCircle2 size={17}/>} {saving?"Creating company...":"Create company workspace"}</button>}
    <p className="gf-card-desc" style={{marginTop:17}}>Requires both database migrations to be applied. Live integrations and AI agents remain off until configured.</p>
   </section>
  </div>}
  {feedback&&<p role="status" className={"gf-feedback "+(warn?"error":"success")} style={{marginTop:18}}>{feedback}</p>}
  <div className="gf-page-actions">
   <div className="gf-row">{step>0&&<button type="button" className="gf-btn gf-btn-quiet" onClick={()=>{setStep(step-1);setFeedback("")}}><ArrowLeft size={16}/> Back</button>}<button type="button" className="gf-btn gf-btn-secondary" onClick={saveDraft}><Save size={16}/>{draftSaved?"Update local draft":"Save local draft"}</button></div>
   {step<3&&<button type="button" className="gf-btn gf-btn-primary" onClick={next}>Continue <ArrowRight size={17}/></button>}
  </div>
 </GFShell>
}
