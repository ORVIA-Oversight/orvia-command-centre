'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Bot, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight,
  CircleAlert, Coins, FileText, FolderKanban, Mail, Megaphone, Mic, MicOff,
  Paperclip, Send, ShieldCheck, Sparkles, Users, Volume2, VolumeX, Workflow,
  Brain, Headphones, UserRoundCog, Camera, Building2, Landmark, Gauge
} from 'lucide-react';

type DashboardState = {
  source?: string;
  openWork?: number | null;
  approvals?: number | null;
  estateReview?: number | null;
  systemIssues?: number | null;
  recentWork?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    approval_required: boolean;
    assigned_to?: string | null;
    source_system?: string | null;
    source_reference?: string | null;
    created_at?: string | null;
  }>;
};

type ExecutiveBrief = {
  live?: boolean;
  hierarchy?: { managingDirector:string; deputy:string; specialists:number; externalWorkers:number };
  layers?: Array<{code:string;label:string;href:string;status:string;ready:boolean;updatedAt?:string|null}>;
  today?: {
    scheduledTasks:any[];
    openWork:number;
    approvals:number;
    mailNeedsJohn:number;
    mailReplyReady:number;
    highRiskMail:number;
  };
  recentMail?: any[];
  recentSharePoint?: any[];
  workforce?: {
    gateway:string;
    specialistTeams:Array<{code:string;name:string;purpose:string;riskCeiling:string}>;
    externalWorkers:Array<{code:string;name:string;connection:string;riskCeiling:string}>;
    schedules:any[];
  };
};

type IrisReply = { status?:string; answer?:string; reason?:string };

const departments = [
  { id:'executive', label:'Executive', note:'Leadership · Strategy · Governance', accent:'#F7C9D7', icon:Landmark, agent:'IRIS' },
  { id:'care', label:'Care Operations', note:'Care Homes · Supported Living · Domiciliary', accent:'#DCCBFF', icon:Building2, agent:'OUT_HSC' },
  { id:'growth', label:'Business Growth', note:'Sales · Marketing · Partnerships', accent:'#BFE1FF', icon:Megaphone, agent:'SALES-01' },
  { id:'people', label:'People & Culture', note:'HR · Recruitment · Training', accent:'#BEEED2', icon:UserRoundCog, agent:'PEOPLE-01' },
  { id:'finance', label:'Finance', note:'Accounts · Budgets · Procurement', accent:'#FFE2B6', icon:Coins, agent:'FINANCE-01' },
  { id:'intelligence', label:'Intelligence', note:'HIVE · VITA / VERA · Security', accent:'#C8F0F0', icon:Brain, agent:'VITA-01' },
  { id:'media', label:'Content & Media', note:'Documents · Media · Brand', accent:'#F6CDE0', icon:Camera, agent:'BRAND-01' },
  { id:'admin', label:'Administration', note:'Email · Calendar · Internal Support', accent:'#D9E5F3', icon:BriefcaseBusiness, agent:'ADMIN-01' },
];

const agentAccent = ['#F4D9DF','#E5DAFF','#D7EBFF','#D7F2E3','#FDE6C9','#DDF1EF','#F2DDE7','#E4E8EF'];

function chooseBritishVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = ['Sonia','Libby','Hazel','Susan','Serena','Microsoft Sonia','Google UK English Female'];
  return voices.find(v=>preferred.some(name=>v.name.toLowerCase().includes(name.toLowerCase())))
    || voices.find(v=>/en-GB/i.test(v.lang))
    || voices.find(v=>/^en/i.test(v.lang))
    || voices[0];
}

function timeLabel(value?:string|null){
  if(!value) return '';
  try{return new Date(value).toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});}catch{return '';}
}

export function IrisCommandHome(){
  const [dashboard,setDashboard]=useState<DashboardState|null>(null);
  const [executive,setExecutive]=useState<ExecutiveBrief|null>(null);
  const [command,setCommand]=useState('');
  const [reply,setReply]=useState('');
  const [sending,setSending]=useState(false);
  const [listening,setListening]=useState(false);
  const [voiceReplies,setVoiceReplies]=useState(true);
  const [voice,setVoice]=useState<SpeechSynthesisVoice|null>(null);
  const [targetAgent,setTargetAgent]=useState('IRIS');

  useEffect(()=>{
    fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.json()).then(setDashboard).catch(()=>setDashboard({source:'unavailable'}));
    fetch('/api/iris/executive',{cache:'no-store'}).then(r=>r.json()).then(setExecutive).catch(()=>setExecutive({live:false}));
  },[]);

  useEffect(()=>{
    if(typeof window==='undefined'||!('speechSynthesis' in window))return;
    const load=()=>setVoice(chooseBritishVoice(window.speechSynthesis.getVoices()));
    load();
    window.speechSynthesis.onvoiceschanged=load;
    return ()=>{ if(window.speechSynthesis.onvoiceschanged===load)window.speechSynthesis.onvoiceschanged=null; };
  },[]);

  const needsAttention=useMemo(()=>Number(dashboard?.approvals??0)+Number(dashboard?.systemIssues??0),[dashboard]);
  const work=(dashboard?.recentWork??[]).slice(0,5);
  const mail=(executive?.recentMail??[]).slice(0,5);
  const sharepoint=(executive?.recentSharePoint??[]).slice(0,5);
  const todayTasks=(executive?.today?.scheduledTasks??[]).slice(0,6);
  const agents=[
    {code:'IRIS',name:'IRIS',role:'Conductor',status:'Online'},
    ...(executive?.workforce?.specialistTeams??[]).slice(0,7).map(x=>({code:x.code,name:x.name.replace(/^ORVIA\s+/,'').split('—')[0].trim(),role:x.purpose?.split('.')[0]||'Specialist',status:'Online'})),
    ...(executive?.workforce?.externalWorkers??[]).slice(0,5).map(x=>({code:x.code,name:x.name.replace(/\s*\/.*$/,'').replace(/^ORVIA\s+/,'').trim(),role:x.code.replace('-WORKER','').replaceAll('-',' '),status:x.connection==='human_activation_required'?'Standby':'Active'}))
  ];

  function speak(text:string){
    if(!voiceReplies||typeof window==='undefined'||!('speechSynthesis' in window)||!text)return;
    window.speechSynthesis.cancel();
    const utterance=new SpeechSynthesisUtterance(text);
    utterance.lang=voice?.lang||'en-GB'; if(voice)utterance.voice=voice; utterance.rate=.98; utterance.pitch=1;
    window.speechSynthesis.speak(utterance);
  }

  function startListening(){
    if(typeof window==='undefined')return;
    const w=window as typeof window & {SpeechRecognition?:new()=>any;webkitSpeechRecognition?:new()=>any};
    const Recognition=w.SpeechRecognition||w.webkitSpeechRecognition;
    if(!Recognition){setReply('Voice input is not available in this browser yet.');return;}
    const recognition=new Recognition();
    recognition.lang='en-GB'; recognition.interimResults=false; recognition.continuous=false;
    recognition.onstart=()=>setListening(true); recognition.onend=()=>setListening(false);
    recognition.onerror=()=>{setListening(false);setReply('I could not hear that clearly. Try again or type the request.');};
    recognition.onresult=(event:any)=>{const t=event?.results?.[0]?.[0]?.transcript||'';if(t)setCommand(t);};
    recognition.start();
  }

  async function askIris(text?:string,agent?:string){
    const question=(text??command).trim();
    if(!question||sending)return;
    const selected=agent||targetAgent;
    setSending(true); setReply('');
    try{
      const r=await fetch('/api/iris/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({
        question,targetAgent:selected,context:{pathname:'/',role:'founder',lens:'Command',experience:'single-conversation',surface:'IRIS'}
      })});
      const data:IrisReply=await r.json().catch(()=>({status:'INCOMPLETE',reason:'IRIS did not return a readable response.'}));
      const message=data.status==='COMPLETE'&&data.answer?data.answer:(data.reason||'IRIS could not verify the answer.');
      setReply(message); setCommand(''); speak(message);
      fetch('/api/dashboard',{cache:'no-store'}).then(x=>x.json()).then(setDashboard).catch(()=>{});
      fetch('/api/iris/executive',{cache:'no-store'}).then(x=>x.json()).then(setExecutive).catch(()=>{});
    }catch{setReply('IRIS is not connected right now. Your request has not been sent anywhere else.');}
    finally{setSending(false);}
  }

  return <div className="irisOS">
    <div className="irisTopCommand">
      <div className="irisTopIcon"><Brain size={16}/></div>
      <input value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'){e.preventDefault();askIris();}}} placeholder="Ask IRIS anything… drag files, paste links, or tell me what to do"/>
      <button title="Attach context"><Paperclip size={16}/></button>
      <button onClick={startListening} className={listening?'active':''} title="Speak to IRIS">{listening?<MicOff size={16}/>:<Mic size={16}/>}</button>
      <select value={targetAgent} onChange={e=>setTargetAgent(e.target.value)} title="Assign to">
        <option value="IRIS">IRIS allocates</option>
        {(executive?.workforce?.specialistTeams??[]).map(x=><option key={x.code} value={x.code}>{x.name}</option>)}
      </select>
      <button className="irisTopSend" onClick={()=>askIris()} disabled={!command.trim()||sending}><Send size={15}/></button>
    </div>

    <div className="irisDashboardGrid">
      <section className="irisMainHero">
        <div className="irisHeroPortrait">
          <div className="irisHumanAvatar">
            <span className="irisAvatarHalo"/>
            <div className="irisAvatarMonogram">I</div>
          </div>
          <div className="irisPortraitStatus"><span/> Online</div>
        </div>
        <div className="irisHeroCopy">
          <small>ORVIA COMMAND · MANAGING DIRECTOR VIEW</small>
          <h1>Good {new Date().getHours()<12?'morning':new Date().getHours()<18?'afternoon':'evening'}.</h1>
          <h2>I’m IRIS — your deputy and AI workforce conductor.</h2>
          <p>{reply||'Here’s what is happening across ORVIA today. You can ask once, assign directly, or let me coordinate the workforce for you.'}</p>
          <div className="irisHeroMetrics">
            <div><span><Workflow size={16}/></span><strong>{dashboard?.openWork??'—'}</strong><small>Active tasks</small></div>
            <div><span><ShieldCheck size={16}/></span><strong>{dashboard?.approvals??'—'}</strong><small>Require approval</small></div>
            <div><span><CheckCircle2 size={16}/></span><strong>{executive?.today?.mailReplyReady??0}</strong><small>Replies ready</small></div>
            <div><span><CircleAlert size={16}/></span><strong>{executive?.today?.highRiskMail??0}</strong><small>Urgent mail</small></div>
          </div>
          <div className="irisHeroActions">
            <button className="primary" onClick={()=>askIris('Give me my full managing director brief for today.')}>Summarise my day</button>
            <button onClick={()=>askIris('Show me team activity and current agent handoffs.')}>Show team activity</button>
            <Link href="/communications">Open key emails</Link>
            <Link href="/work">Review approvals</Link>
          </div>
        </div>
        <button className="irisVoiceRound" onClick={()=>setVoiceReplies(v=>!v)}>{voiceReplies?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
      </section>

      <aside className="irisTodayCard">
        <div className="irisPanelHead"><div><small>TODAY</small><h3>{new Date().toLocaleDateString('en-GB',{weekday:'long',day:'numeric',month:'long'})}</h3></div><Link href="/work">View all <ChevronRight size={14}/></Link></div>
        <div className="irisAgenda">
          {todayTasks.length?todayTasks.map((t:any,i:number)=><button key={t.id||i} onClick={()=>{setTargetAgent(t.owner||'IRIS');setCommand(t.title||'Review this task')}}>
            <time>{timeLabel(t.due_at)||'Today'}</time><span className={'agendaIcon a'+(i%6)}><CalendarDays size={15}/></span><div><b>{t.title}</b><small>{t.owner||'IRIS'}{t.approval_required?' · approval needed':''}</small></div><ChevronRight size={14}/>
          </button>):<div className="irisEmptyState">No timed items in Command yet.</div>}
        </div>
      </aside>
    </div>

    <section className="irisOSSection">
      <div className="irisPanelHead"><div><small>DEPARTMENTS</small><h3>Your AI + human workforce, organised by function.</h3></div><Link href="/workforce">Manage <ChevronRight size={14}/></Link></div>
      <div className="irisDepartmentGrid">
        {departments.map(({id,label,note,accent,icon:Icon,agent})=><button id={id} key={id} style={{background:accent}} onClick={()=>{setTargetAgent(agent);setCommand(`Open the ${label} department and brief me on what needs attention.`)}}>
          <span className="departmentIcon"><Icon size={20}/></span><b>{label}</b><small>{note}</small><ChevronRight size={15}/>
        </button>)}
      </div>
    </section>

    <section className="irisOSSection">
      <div className="irisPanelHead"><div><small>AI WORKFORCE</small><h3>Specialist agents and provider workers working together for you.</h3></div><Link href="/workforce">View all <ChevronRight size={14}/></Link></div>
      <div className="irisAgentStrip">
        {agents.slice(0,13).map((a,i)=><button key={a.code} onClick={()=>{setTargetAgent(a.code);setCommand(`${a.name}, brief me on your current work and anything you need from me.`)}}>
          <div className="agentPortrait" style={{background:agentAccent[i%agentAccent.length]}}>{a.code==='IRIS'?<Sparkles size={24}/>:a.code.includes('WORKER')?<Bot size={24}/>:<span>{a.name.slice(0,1)}</span>}</div>
          <b>{a.name}</b><small>{a.role}</small><em className={a.status==='Standby'?'standby':''}><i/>{a.status}</em>
        </button>)}
      </div>
    </section>

    <section className="irisLiveGrid">
      <article className="irisLiveCard">
        <div className="irisPanelHead compact"><div><small>INBOX</small><h3>What needs a response</h3></div><Link href="/communications">View all <ChevronRight size={14}/></Link></div>
        <div className="irisMiniList">
          {mail.length?mail.map((m:any)=><div key={m.id}><span className="miniIcon mail"><Mail size={14}/></span><div><b>{m.subject||'(No subject)'}</b><small>{m.from_name||m.from_address||'Unknown sender'}</small></div><time>{timeLabel(m.received_at)}</time></div>):<div className="irisEmptyState">Connect/sync Command Mail to populate this card.</div>}
        </div>
      </article>

      <article className="irisLiveCard">
        <div className="irisPanelHead compact"><div><small>MONDAY.COM / WORK</small><h3>Current delivery</h3></div><Link href="/work">Open projects <ChevronRight size={14}/></Link></div>
        <div className="irisMiniList">
          {work.length?work.map((w:any,i)=><div key={w.id}><span className={'miniIcon work w'+(i%4)}><FolderKanban size={14}/></span><div><b>{w.title}</b><small>{w.assigned_to||w.source_system||'IRIS'}</small></div><span className="miniState">{String(w.status||'open').replaceAll('_',' ')}</span></div>):<div className="irisEmptyState">No active work items.</div>}
        </div>
      </article>

      <article className="irisLiveCard">
        <div className="irisPanelHead compact"><div><small>SHAREPOINT</small><h3>Recent evidence & files</h3></div><Link href="/library">Recent files <ChevronRight size={14}/></Link></div>
        <div className="irisMiniList">
          {sharepoint.length?sharepoint.map((s:any)=><div key={s.id}><span className="miniIcon sp"><FileText size={14}/></span><div><b>{s.file_name||s.asset_type||'SharePoint item'}</b><small>{s.business_area_code||s.asset_type||'ORVIA HUB'}</small></div><ChevronRight size={13}/></div>):<div className="irisEmptyState">No recent SharePoint assets registered yet.</div>}
        </div>
      </article>

      <article className="irisLiveCard">
        <div className="irisPanelHead compact"><div><small>ACTIVE TASKS</small><h3>Your immediate queue</h3></div><Link href="/work">View all <ChevronRight size={14}/></Link></div>
        <div className="irisTaskList">
          {work.length?work.map((w:any)=><button key={w.id} onClick={()=>{setTargetAgent(w.assigned_to||'IRIS');setCommand(`Review this task: ${w.title}`)}}>
            <span className="taskCheck"/><b>{w.title}</b><em className={String(w.priority).toLowerCase()}>{w.priority||'normal'}</em>
          </button>):<div className="irisEmptyState">No active tasks.</div>}
        </div>
      </article>
    </section>

    <div className="irisOSFooter">
      <div><Gauge size={15}/><span>{executive?.hierarchy?.specialists??0} specialist roles · {executive?.hierarchy?.externalWorkers??0} external workers</span></div>
      <div><Headphones size={15}/><span>IRIS coordinates · human authority retained</span></div>
      <div className={needsAttention?'warn':''}><ShieldCheck size={15}/><span>{needsAttention} approvals / exceptions</span></div>
    </div>
  </div>;
}
