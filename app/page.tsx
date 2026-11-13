import Link from "next/link";
import {ArrowRight,ArrowUpRight,Bot,Boxes,Building2,CheckCircle2,ChevronRight,Command,Database,Globe2,Layers3,LockKeyhole,MessageSquareMore,Network,Plus,ShieldCheck,Sparkles,Users,Workflow} from "lucide-react";
import {GFShell,GFState} from "../components/gf-shell";
import {BUSINESS_TEMPLATES,MODULES} from "../lib/business-models";
const features=[
 {icon:Layers3,title:"Company Studio",text:"Create a business, design the company structure and choose the operating modules that fit.",status:"Built"},
 {icon:Database,title:"Universal Data Studio",text:"Custom entity types and fields for every business—from inventory to case management.",status:"Built"},
 {icon:Network,title:"Organization Graph",text:"Independent branches, departments, divisions and reporting units.",status:"Built"},
 {icon:Bot,title:"GulfFlow Intelligence",text:"A documentation-aware assistant scoped to each company's approved knowledge.",status:"Built"},
 {icon:Workflow,title:"Flow Studio",text:"Configure workflow definitions before connecting a secure execution engine.",status:"Draft editor"},
 {icon:Globe2,title:"Integration Hub",text:"Provider-ready architecture for messaging, calendars, AI, payments and webhooks.",status:"Connections pending"},
];
export default function HomePage(){
 return <GFShell eyebrow="THE UNIVERSAL AI BUSINESS OPERATING SYSTEM" title="Welcome to GulfFlow AI" description="One intelligent foundation. Independently configured for every organization, business model and operational structure." aside={<Link href="/studio" className="gf-btn gf-btn-primary"><Plus size={16}/> Create company</Link>}>
   <section className="gf-hero">
    <div className="gf-hero-content"><div className="gf-row" style={{marginBottom:23}}><GFState tone="positive"><CheckCircle2 size={14}/> Platform foundation deployed</GFState><GFState>Qatar-first · Global-ready</GFState></div>
      <h2>Every business runs differently.<br/><span className="gf-gradient-text">GulfFlow adapts.</span></h2>
      <p>Give each company its own departments, records, intelligent assistants and workflows—without rebuilding the software every time. You choose what the business needs.</p>
      <div className="gf-hero-actions"><Link className="gf-btn gf-btn-primary" href="/studio">Design your business <ArrowRight size={17}/></Link><Link className="gf-btn gf-btn-secondary" href="/workspace">Open workspace <ArrowUpRight size={17}/></Link></div>
    </div>
    <div className="gf-hero-window"><div style={{display:"flex",gap:5,background:"transparent",height:8,margin:"0 0 20px"}}><span style={{height:8,width:8,borderRadius:"50%",background:"#f78793"}}/><span style={{height:8,width:8,borderRadius:"50%",background:"#f6cd79"}}/><span style={{height:8,width:8,borderRadius:"50%",background:"#78dcb8"}}/></div><div/><div/><div/><div style={{height:88,width:"100%",borderRadius:17,background:"linear-gradient(135deg,rgba(155,168,255,.4),rgba(100,211,220,.18))"}}/></div>
   </section>
   <div className="gf-grid-4" style={{marginTop:18}}>
     {[[MODULES.length,"Optional modules","One platform"],[BUSINESS_TEMPLATES.length,"Starting blueprints","All editable"],["∞","Organization patterns","Branch, team, holding and more"],["100%","Company separation","RLS-backed data access"]].map(([value,label,description])=><div className="gf-card gf-metric" key={label}><span>{label}</span><strong>{value}</strong><small>{description}</small></div>)}
   </div>
   <div className="gf-section-heading"><h2>Build your own business OS</h2><p>Real building blocks you can configure for services, commerce, logistics, education, property, agencies and entirely new models.</p></div>
   <div className="gf-grid-3 gf-feature-grid">{features.map(x=><section key={x.title} className="gf-card"><span className="gf-feature-icon"><x.icon size={22}/></span><div className="gf-between"><h3>{x.title}</h3><GFState tone={x.status==="Built"?"positive":"warning"}>{x.status}</GFState></div><p className="gf-card-desc">{x.text}</p></section>)}</div>
   <div className="gf-section-heading"><h2>Use a blueprint. Or invent your own.</h2><p>Each template suggests an initial configuration. None of them limits your business after creation.</p></div>
   <div className="gf-grid-3">{BUSINESS_TEMPLATES.slice(0,6).map(x=><div className="gf-card-soft" key={x.key}><div className="gf-between"><span className="gf-small-caps">{x.group}</span><ChevronRight size={17} color="var(--gf-muted)"/></div><h3 style={{marginTop:14}}>{x.name}</h3><p className="gf-card-desc">{x.description}</p><div className="gf-tag-list">{x.modules.slice(0,3).map(m=><GFState key={m}>{MODULES.find(x=>x.key===m)?.label||m}</GFState>)}</div></div>)}</div>
   <div className="gf-grid-2" style={{marginTop:25}}>
    <div className="gf-card" style={{background:"linear-gradient(130deg,rgba(78,92,213,.17),rgba(21,120,134,.10))"}}><span className="gf-feature-icon"><ShieldCheck size={21}/></span><h2>Security is part of the architecture.</h2><p className="gf-card-desc">The backend uses company-level memberships and Supabase Row Level Security policies. Owner permissions govern configuration. Production onboarding still requires the migrations and security checks.</p><Link href="/workspace" className="gf-btn gf-btn-secondary" style={{marginTop:14}}>Explore workspaces <ArrowRight size={16}/></Link></div>
    <div className="gf-card"><span className="gf-feature-icon"><Sparkles size={21}/></span><h2>AI that understands how GulfFlow operates.</h2><p className="gf-card-desc">Copilot searches structured platform documentation and the selected company's approved configuration. Connect a supported AI model to enable more natural reasoning.</p><Link href="/copilot" className="gf-btn gf-btn-secondary" style={{marginTop:14}}>Meet GulfFlow Intelligence <ArrowRight size={16}/></Link></div>
   </div>
   <div className="gf-info-strip" style={{marginTop:24}}><LockKeyhole size={17}/><span>Transparency matters: this is a development-stage product. The UI, company configuration and authorized CRUD interfaces are implemented. Provider integrations, automation execution, payment processing and production readiness are not yet complete.</span></div>
 </GFShell>
}
