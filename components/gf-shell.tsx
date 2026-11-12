"use client";
import Link from "next/link";
import {usePathname} from "next/navigation";
import {useEffect,useState,type ReactNode} from "react";
import {Activity,ArrowUpRight,Bot,Building2,CheckCircle2,ChevronRight,Command,Database,Globe2,Home,Layers3,Menu,MessageCircle,Settings2,Sparkles,Sun,Moon,Workflow,X} from "lucide-react";
const links=[
 {href:"/",label:"Home",icon:Home},
 {href:"/studio",label:"Company Studio",icon:Layers3},
 {href:"/workspace",label:"Workspaces",icon:Building2},
 {href:"/copilot",label:"GulfFlow Intelligence",icon:Bot},
 {href:"/demo",label:"Interactive demo",icon:Activity},
];
export function GFShell({children,eyebrow,title,description,aside}:{children:ReactNode;eyebrow?:string;title:string;description?:string;aside?:ReactNode}){
 const path=usePathname();
 const [theme,setTheme]=useState<"dark"|"light">("dark");
 const [mobile,setMobile]=useState(false);
 useEffect(()=>{const saved=localStorage.getItem("gf-theme");if(saved==="light")setTheme("light")},[]);
 function toggleTheme(){setTheme(v=>{const n=v==="dark"?"light":"dark";localStorage.setItem("gf-theme",n);return n})}
 return <main className={"gf-app gf-"+theme}>
  <div className="gf-aurora gf-aurora-one"/><div className="gf-aurora gf-aurora-two"/>
  <div className="gf-layout">
   <aside className={"gf-sidebar gf-glass "+(mobile?"gf-sidebar-open":"")}>
    <Link href="/" className="gf-brand" onClick={()=>setMobile(false)}><span className="gf-brand-symbol"><Sparkles size={22}/></span><span>GulfFlow <b>AI</b><small>BUSINESS OPERATING SYSTEM</small></span></Link>
    <div className="gf-sidebar-caption">PLATFORM</div>
    <nav className="gf-side-nav" aria-label="Main navigation">{links.map(item=><Link onClick={()=>setMobile(false)} className={path===item.href?"gf-nav-active":""} key={item.href} href={item.href}><item.icon size={18}/>{item.label}<ChevronRight size={14} className="gf-nav-arrow"/></Link>)}</nav>
    <div className="gf-sidebar-spacer"/>
    <div className="gf-side-callout"><span className="gf-small-caps"><Globe2 size={14}/> DESIGNED TO ADAPT</span><strong>Every business. One intelligent platform.</strong><p>Build each company around how it actually operates.</p><Link href="/studio">Configure company <ArrowUpRight size={15}/></Link></div>
    <div className="gf-sidebar-footer"><span className="gf-status-dot"/> Development preview <span>v0.5</span></div>
   </aside>
   <div className="gf-main">
    <header className="gf-topbar gf-glass">
     <div className="gf-top-left"><button className="gf-mobile-toggle" aria-label={mobile?"Close navigation":"Open navigation"} onClick={()=>setMobile(!mobile)}>{mobile?<X size={20}/>:<Menu size={20}/>}</button><span className="gf-top-brand">GULFFLOW OS</span><span className="gf-top-divider">/</span><span className="gf-top-location">{title}</span></div>
     <div className="gf-top-right"><span className="gf-version"><CheckCircle2 size={13}/> Secure by design</span><button className="gf-icon-button" onClick={toggleTheme} aria-label="Toggle theme">{theme==="dark"?<Sun size={19}/>:<Moon size={19}/>}</button><Link href="/sign-in" className="gf-avatar" aria-label="Account">GF</Link></div>
    </header>
    <div className="gf-content">
     <div className="gf-page-heading"><div><div className="gf-eyebrow"><Sparkles size={15}/>{eyebrow||"INTELLIGENT BUSINESS OPERATIONS"}</div><h1>{title}</h1>{description&&<p>{description}</p>}</div>{aside&&<div className="gf-heading-aside">{aside}</div>}</div>
     {children}
     <footer className="gf-footer"><span>© GulfFlow AI · Built for adaptable companies</span><span>Prototype and configured integrations are labeled honestly</span></footer>
    </div>
   </div>
  </div>
 </main>
}
export function GFEmpty({icon,title,children}:{icon?:ReactNode;title:string;children:ReactNode}){return <div className="gf-empty">{icon&&<div className="gf-empty-icon">{icon}</div>}<h3>{title}</h3><p>{children}</p></div>}
export function GFState({tone="neutral",children}:{tone?:"positive"|"warning"|"neutral";children:ReactNode}){return <span className={"gf-pill gf-pill-"+tone}>{children}</span>}
