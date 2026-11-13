"use client";
import Link from "next/link";
import {useEffect,useState,type FormEvent} from "react";
import {useRouter} from "next/navigation";
import {ArrowRight,CheckCircle2,KeyRound,LockKeyhole,Mail,ShieldCheck,Sparkles,UserPlus} from "lucide-react";
import {GFShell} from "../../components/gf-shell";
import {explainSupabaseError,getBrowserClient,supabaseConfigured} from "../../lib/supabase-browser";
export default function SignInPage(){
 const router=useRouter();
 const [mode,setMode]=useState<"signin"|"signup"|"reset">("signin");
 const [email,setEmail]=useState("");
 const [password,setPassword]=useState("");
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState("");
 const [notice,setNotice]=useState("");
 useEffect(()=>{const db=getBrowserClient();if(!db)return;void db.auth.getUser().then(({data})=>{if(data.user)router.replace("/workspace")})},[router]);
 async function submit(event:FormEvent){
  event.preventDefault();setBusy(true);setError("");setNotice("");
  const db=getBrowserClient();if(!db){setError("Supabase authentication is not configured on this deployment.");setBusy(false);return}
  try{
   if(mode==="reset"){
    const {error}=await db.auth.resetPasswordForEmail(email,{redirectTo:window.location.origin+"/sign-in"});
    if(error)throw error;
    setNotice("If this email is registered, password recovery instructions have been sent.");
   }else if(mode==="signup"){
    if(password.length<8){setError("Use a password with at least 8 characters.");setBusy(false);return}
    const {data,error}=await db.auth.signUp({email,password,options:{emailRedirectTo:window.location.origin+"/workspace"}});
    if(error)throw error;
    if(data.session){router.replace("/studio")}
    else setNotice("Check your email for the verification link, then sign in to create your company.");
   }else{
    const {error}=await db.auth.signInWithPassword({email,password});
    if(error)throw error;
    router.replace("/workspace");
   }
  }catch(err){setError(explainSupabaseError(err))}finally{setBusy(false)}
 }
 return <GFShell eyebrow="SECURE WORKSPACE ACCESS" title="Account access" description="Sign in to manage the organizations, AI agents and operating workflows you own. Each business maintains its own independent workspace.">
   <div className="gf-auth-wrap"><div className="gf-card" style={{padding:32}}>
    <div className="gf-auth-mark"><Sparkles size={30} color="white"/></div>
    <div className="gf-auth-head"><h2>{mode==="signup"?"Create your GulfFlow account":mode==="reset"?"Reset your password":"Welcome back"}</h2><p>{mode==="signup"?"One account, unlimited business configurations.":mode==="reset"?"We'll email you recovery instructions.":"Access your business control center securely."}</p></div>
    <form className="gf-form" onSubmit={e=>void submit(e)}>
      <label className="gf-field"><span>Email address</span><div className="gf-row" style={{position:"relative"}}><Mail size={17} style={{position:"absolute",left:13,color:"var(--gf-muted)"}}/><input type="email" autoComplete="email" className="gf-input" style={{paddingLeft:40}} value={email} onChange={e=>setEmail(e.target.value)} required maxLength={254} placeholder="you@company.com"/></div></label>
      {mode!=="reset"&&<label className="gf-field"><span>Password</span><div className="gf-row" style={{position:"relative"}}><LockKeyhole size={17} style={{position:"absolute",left:13,color:"var(--gf-muted)"}}/><input type="password" autoComplete={mode==="signin"?"current-password":"new-password"} className="gf-input" style={{paddingLeft:40}} value={password} onChange={e=>setPassword(e.target.value)} required minLength={mode==="signup"?8:1} placeholder="Enter your password"/></div></label>}
      {error&&<p role="alert" className="gf-feedback error">{error}</p>}
      {notice&&<p role="status" className="gf-feedback success"><CheckCircle2 size={14} style={{verticalAlign:"middle",marginRight:6}}/>{notice}</p>}
      {!supabaseConfigured()&&<p className="gf-feedback error">Supabase environment variables are unavailable. Contact the platform administrator.</p>}
      <button className="gf-btn gf-btn-primary" type="submit" disabled={busy||!supabaseConfigured()} style={{width:"100%"}}>{busy?<span className="gf-busy"/>:mode==="signup"?<UserPlus size={17}/>:<KeyRound size={17}/>} {busy?"Working...":mode==="signup"?"Create account":mode==="reset"?"Send recovery email":"Sign in"} <ArrowRight size={16}/></button>
    </form>
    <div className="gf-divider"/>
    <div style={{display:"flex",justifyContent:"center",gap:13,flexWrap:"wrap"}}>
      <button type="button" className="gf-btn gf-btn-quiet" onClick={()=>{setMode(mode==="signup"?"signin":"signup");setError("");setNotice("")}}>{mode==="signup"?"Already have an account? Sign in":"Create an account"}</button>
      <button type="button" className="gf-btn gf-btn-quiet" onClick={()=>{setMode(mode==="reset"?"signin":"reset");setError("");setNotice("")}}>{mode==="reset"?"Back to sign in":"Forgot password?"}</button>
    </div>
   </div>
   <div className="gf-row" style={{justifyContent:"center",marginTop:20,color:"var(--gf-muted)",fontSize:11}}><ShieldCheck size={17} color="var(--gf-good)"/> Email verification · Organization-level data permissions · No shared passwords</div>
   </div>
 </GFShell>
}
