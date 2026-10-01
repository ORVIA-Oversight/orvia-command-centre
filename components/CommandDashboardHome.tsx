'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import {
  Bell, Brain, BriefcaseBusiness, CalendarDays, CheckCircle2, ChevronRight,
  CircleDollarSign, FileText, FolderOpen, Image as ImageIcon, Mail, Mic, MicOff,
  Send, Settings2, ShieldCheck, Sparkles, Users, Volume2, VolumeX, Workflow
} from 'lucide-react';

type DashboardState = {
  source?: string;
  openWork?: number | null;
  approvals?: number | null;
  systemIssues?: number | null;
  recentWork?: Array<{
    id: string;
    title: string;
    status: string;
    priority: string;
    approval_required: boolean;
  }>;
};

type ExecutiveBrief = {
  live?: boolean;
  today?: {
    scheduledTasks?: any[];
    openWork?: number;
    approvals?: number;
    mailNeedsJohn?: number;
    mailReplyReady?: number;
    highRiskMail?: number;
  };
  workforce?: {
    specialistTeams?: Array<{
      code: string;
      name: string;
      purpose: string;
      department?: string;
      accent?: string | null;
      avatarUri?: string | null;
    }>;
    externalWorkers?: Array<{
      code: string;
      name: string;
      connection: string;
      department?: string;
      accent?: string | null;
      avatarUri?: string | null;
    }>;
  };
};

type IrisReply = { status?: string; answer?: string; reason?: string };

const departments = [
  { name:'Executive', detail:['Leadership','Strategy','Governance'], tone:'pink', icon:BriefcaseBusiness, href:'/work' },
  { name:'Care Operations', detail:['Care Homes','Supported Living','Domiciliary'], tone:'purple', icon:Users, href:'/workforce' },
  { name:'Business Growth', detail:['Sales','Marketing','Partnerships'], tone:'blue', icon:Workflow, href:'/projects' },
  { name:'People & Culture', detail:['HR','Recruitment','Training'], tone:'green', icon:Users, href:'/workforce' },
  { name:'Finance', detail:['Accounts','Budgets','Procurement'], tone:'gold', icon:CircleDollarSign, href:'/work' },
  { name:'Intelligence', detail:['HIVE','VITA / VERA','Security'], tone:'teal', icon:Brain, href:'/intelligence' },
  { name:'Content & Media', detail:['Documents','Media Generation','Brand'], tone:'rose', icon:ImageIcon, href:'/production' },
  { name:'Administration', detail:['Email','Calendar','Internal Support'], tone:'slate', icon:Settings2, href:'/communications' },
];

function chooseBritishVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = ['Sonia','Libby','Hazel','Susan','Serena','Microsoft Sonia','Google UK English Female'];
  return voices.find(v => preferred.some(name => v.name.toLowerCase().includes(name.toLowerCase())))
    || voices.find(v => /en-GB/i.test(v.lang))
    || voices.find(v => /^en/i.test(v.lang))
    || voices[0];
}

function timeLabel(item:any, index:number) {
  return item?.time || item?.start || item?.startsAt || item?.scheduled_for || ['08:30','09:00','10:30','12:00','14:00','16:00'][index] || '';
}

function titleLabel(item:any) {
  return item?.title || item?.name || item?.summary || item?.task || 'Scheduled item';
}

export function CommandDashboardHome() {
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [executive, setExecutive] = useState<ExecutiveBrief | null>(null);
  const [command, setCommand] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const ariaAudioRef = useRef<HTMLAudioElement | null>(null);
  const ariaAvatarUrl = process.env.NEXT_PUBLIC_ARIA_AVATAR_URL || '/aria-face.jpg';

  useEffect(() => {
    fetch('/api/dashboard', { cache:'no-store' }).then(r=>r.json()).then(setDashboard).catch(()=>setDashboard({source:'unavailable'}));
    fetch('/api/iris/executive', { cache:'no-store' }).then(r=>r.json()).then(setExecutive).catch(()=>setExecutive({live:false}));
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    const load = () => setVoice(chooseBritishVoice(window.speechSynthesis.getVoices()));
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => {
      if (window.speechSynthesis.onvoiceschanged === load) window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  const counts = useMemo(() => ({
    active: dashboard?.source === 'live' ? dashboard?.openWork ?? executive?.today?.openWork ?? 0 : executive?.today?.openWork ?? 0,
    approvals: dashboard?.source === 'live' ? dashboard?.approvals ?? executive?.today?.approvals ?? 0 : executive?.today?.approvals ?? 0,
    progress: (dashboard?.recentWork || []).filter(x => /progress|active|working/i.test(x.status || '')).length,
    urgent: (dashboard?.recentWork || []).filter(x => /urgent|high|critical/i.test(x.priority || '')).length + (executive?.today?.highRiskMail || 0),
    messages: (executive?.today?.mailNeedsJohn || 0) + (executive?.today?.mailReplyReady || 0),
  }), [dashboard, executive]);

  const workforce = useMemo(() => [
    ...(executive?.workforce?.specialistTeams || []).map(x=>({...x, kind:'specialist'})),
    ...(executive?.workforce?.externalWorkers || []).map(x=>({...x, purpose:x.connection, kind:'external'})),
  ].slice(0,12), [executive]);

  const agenda = (executive?.today?.scheduledTasks || []).slice(0,6);
  const recent = (dashboard?.recentWork || []).slice(0,5);

  async function speak(text:string) {
    if (!voiceReplies || typeof window === 'undefined' || !text) return;

    try {
      ariaAudioRef.current?.pause();
      const response = await fetch('/api/aria/speech', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({ text })
      });
      if (response.ok) {
        const data = await response.json();
        if (data?.audioUrl) {
          const audio = new Audio(data.audioUrl);
          ariaAudioRef.current = audio;
          await audio.play();
          return;
        }
      }
    } catch {
      // Fall through to the browser voice if HeyGen is temporarily unavailable.
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = voice?.lang || 'en-GB';
      if (voice) u.voice = voice;
      u.rate = .98;
      window.speechSynthesis.speak(u);
    }
  }

  function startListening() {
    if (typeof window === 'undefined') return;
    const w = window as typeof window & { SpeechRecognition?: new()=>any; webkitSpeechRecognition?: new()=>any };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) { setReply('Voice input is not available in this browser yet. You can still type to IRIS.'); return; }
    const recognition = new Recognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => setListening(false);
    recognition.onresult = (event:any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript) setCommand(transcript);
    };
    recognition.start();
  }

  async function askIris(text?:string) {
    const question = (text ?? command).trim();
    if (!question || sending) return;
    setSending(true);
    try {
      const r = await fetch('/api/iris/ask', {
        method:'POST',
        headers:{'content-type':'application/json'},
        body:JSON.stringify({
          question,
          context:{ pathname:'/', role:'founder', lens:'Command', experience:'executive-dashboard', surface:'IRIS' },
          targetAgent:'IRIS'
        })
      });
      const data:IrisReply = await r.json().catch(()=>({status:'INCOMPLETE',reason:'IRIS did not return a readable response.'}));
      const message = data.status === 'COMPLETE' && data.answer ? data.answer : (data.reason || 'IRIS could not verify the answer.');
      setReply(message);
      setCommand('');
      speak(message);
      fetch('/api/dashboard',{cache:'no-store'}).then(x=>x.json()).then(setDashboard).catch(()=>{});
      fetch('/api/iris/executive',{cache:'no-store'}).then(x=>x.json()).then(setExecutive).catch(()=>{});
    } catch {
      setReply('IRIS is not connected right now. Your request has not been sent anywhere else.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="commandDash">
      <div className="commandDashTop">
        <form className="commandDashAsk" onSubmit={e=>{e.preventDefault();askIris();}}>
          <span className="commandDashAskMark"><Sparkles size={15}/></span>
          <input value={command} onChange={e=>setCommand(e.target.value)} placeholder="Ask IRIS anything… drag files, paste links, or tell me what to do" />
          <button type="button" className={listening?'active':''} onClick={startListening} title="Speak to IRIS">{listening?<MicOff size={17}/>:<Mic size={17}/>}</button>
          <button type="button" onClick={()=>{
            if (voiceReplies) {
              ariaAudioRef.current?.pause();
              if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
            }
            setVoiceReplies(v=>!v);
          }} title="Toggle spoken replies">{voiceReplies?<Volume2 size={17}/>:<VolumeX size={17}/>}</button>
          <button className="commandDashSend" disabled={!command.trim() || sending} title="Send to IRIS"><Send size={16}/></button>
        </form>
        <Link className="commandDashBell" href="/work"><Bell size={18}/><i/></Link>
        <div className="commandDashUser"><span>JM</span><div><b>John McGill</b><small>Managing Director · ORVIA Command</small></div></div>
      </div>

      <div className="commandDashLead">
        <section className="commandDashHero">
          <div className="commandDashAvatar">
            <img src={ariaAvatarUrl} alt="ARIA — the visible face and voice of IRIS" />
          </div>
          <div className="commandDashHeroCopy">
            <small>ORVIA COMMAND</small>
            <h1>Good morning, John.</h1>
            <h2>I’m IRIS — your deputy and AI workforce conductor.</h2>
            <p>Here’s what’s happening across ORVIA today.</p>

            <div className="commandDashMetrics">
              <div><b>{counts.active}</b><span>Active tasks</span></div>
              <div><b>{counts.approvals}</b><span>Require your approval</span></div>
              <div><b>{counts.progress}</b><span>In progress</span></div>
              <div><b>{counts.urgent}</b><span>Urgent</span></div>
              <div><b>{counts.messages}</b><span>New messages</span></div>
            </div>

            <div className="commandDashHeroActions">
              <button className="primary" onClick={()=>askIris('Summarise my day across ORVIA, including diary, email, work, risks and approvals.')}>Summarise my day</button>
              <button onClick={()=>askIris('Show me current team activity and anything blocked or waiting.')}>Show team activity</button>
              <Link href="/communications">Open key emails</Link>
              <Link href="/work">Review approvals</Link>
            </div>
            {reply && <div className="commandDashReply"><Sparkles size={15}/><span>{reply}</span></div>}
          </div>
          <div className="commandDashHeroBrand"><b>ORVIA</b><span>INTELLIGENCE IN ACTION</span><em>IRIS</em></div>
        </section>

        <aside className="commandDashToday">
          <div className="commandDashPanelHead"><div><h3>Today</h3><span>Wednesday 1 October 2026</span></div><Link href="/work">View all <ChevronRight size={14}/></Link></div>
          <div className="commandDashAgenda">
            {agenda.length ? agenda.map((item,index)=>(
              <div key={item.id || index} className="commandDashAgendaRow">
                <time>{timeLabel(item,index)}</time>
                <span className={'agendaIcon tone'+(index%6)}><CalendarDays size={15}/></span>
                <div><b>{titleLabel(item)}</b><small>{item?.department || item?.owner || item?.status || 'IRIS · scheduled'}</small></div>
                <ChevronRight size={14}/>
              </div>
            )) : (
              <>
                <div className="commandDashAgendaEmpty"><CalendarDays size={20}/><b>Your live schedule will appear here.</b><span>IRIS will combine calendar, work and approvals into one day view.</span></div>
                <Link className="commandDashAgendaLink" href="/communications">Open calendar & communications <ChevronRight size={14}/></Link>
              </>
            )}
          </div>
        </aside>
      </div>

      <section className="commandDashSection">
        <div className="commandDashSectionTitle"><div><h3>Departments</h3><span>Your complete AI + human workforce, organised by function.</span></div><Link href="/workforce">Manage <ChevronRight size={14}/></Link></div>
        <div className="commandDashDepartments">
          {departments.map(({name,detail,tone,icon:Icon,href})=>(
            <Link key={name} href={href} className={'commandDashDepartment '+tone}>
              <span className="departmentIcon"><Icon size={20}/></span>
              <b>{name}</b>
              <small>{detail.map(x=><span key={x}>{x}</span>)}</small>
              <ChevronRight size={15}/>
            </Link>
          ))}
        </div>
      </section>

      <section className="commandDashSection">
        <div className="commandDashSectionTitle"><div><h3>AI Workforce</h3><span>Specialist agents and connected workers coordinated through IRIS.</span></div><Link href="/workforce">View all <ChevronRight size={14}/></Link></div>
        <div className="commandDashWorkforce">
          <button className="commandDashWorker irisWorker" onClick={()=>askIris('Give me the managing director brief and coordinate the workforce around today’s priorities.')}>
            <div className="commandDashWorkerAvatar">
              <img src={ariaAvatarUrl} alt="ARIA" />
            </div>
            <b>IRIS</b><span>Conductor</span><small><i/>Online</small>
          </button>
          {workforce.length ? workforce.map((agent:any)=>(
            <Link href="/workforce" key={agent.code} className="commandDashWorker">
              <div className="commandDashWorkerAvatar" style={{background:agent.accent || undefined}}>
                {agent.avatarUri ? <img src={agent.avatarUri} alt="" /> : <span>{String(agent.name).split(' ').slice(0,2).map((x:string)=>x[0]).join('').toUpperCase()}</span>}
              </div>
              <b>{agent.name}</b><span>{agent.department || (agent.kind==='external'?'Connected AI':'Specialist')}</span><small><i/>Active</small>
            </Link>
          )) : (
            <>
              <Link href="/workforce" className="commandDashWorker"><div className="commandDashWorkerAvatar bot"><Users size={21}/></div><b>Care Operations</b><span>Specialist team</span><small><i/>Ready</small></Link>
              <Link href="/workforce" className="commandDashWorker"><div className="commandDashWorkerAvatar bot"><Brain size={21}/></div><b>Intelligence</b><span>HIVE · VITA · VERA</span><small><i/>Ready</small></Link>
              <Link href="/systems" className="commandDashWorker"><div className="commandDashWorkerAvatar bot"><Workflow size={21}/></div><b>Connected AI</b><span>External workers</span><small><i/>Ready</small></Link>
            </>
          )}
        </div>
      </section>

      <div className="commandDashBottom">
        <section className="commandDashMiniPanel">
          <div className="commandDashPanelHead"><div><h3>Inbox</h3><span>Communications requiring attention</span></div><Link href="/communications">View all <ChevronRight size={14}/></Link></div>
          <div className="commandDashMiniRows">
            <Link href="/communications"><span className="miniIcon mail"><Mail size={14}/></span><div><b>Command Mail</b><small>{counts.messages ? counts.messages+' items need review' : 'Open communications workspace'}</small></div><ChevronRight size={14}/></Link>
            <Link href="/communications"><span className="miniIcon calendar"><CalendarDays size={14}/></span><div><b>Calendar</b><small>Meetings, diary and follow-ups</small></div><ChevronRight size={14}/></Link>
          </div>
        </section>

        <section className="commandDashMiniPanel">
          <div className="commandDashPanelHead"><div><h3>Projects</h3><span>Connected workspaces</span></div><Link href="/projects">Open projects <ChevronRight size={14}/></Link></div>
          <div className="commandDashMiniRows">
            <Link href="/projects"><span className="miniIcon projects"><BriefcaseBusiness size={14}/></span><div><b>ORVIA Landscape</b><small>Products, sites and delivery work</small></div><ChevronRight size={14}/></Link>
            <Link href="/systems"><span className="miniIcon automation"><Workflow size={14}/></span><div><b>Automations</b><small>Systems, agents and integrations</small></div><ChevronRight size={14}/></Link>
          </div>
        </section>

        <section className="commandDashMiniPanel">
          <div className="commandDashPanelHead"><div><h3>HIVE</h3><span>Knowledge and evidence</span></div><Link href="/library">Recent files <ChevronRight size={14}/></Link></div>
          <div className="commandDashMiniRows">
            <Link href="/library"><span className="miniIcon files"><FolderOpen size={14}/></span><div><b>Evidence library</b><small>Controlled knowledge and source material</small></div><ChevronRight size={14}/></Link>
            <Link href="/library"><span className="miniIcon docs"><FileText size={14}/></span><div><b>Files & media</b><small>Drop files, links and evidence into IRIS</small></div><ChevronRight size={14}/></Link>
          </div>
        </section>

        <section className="commandDashMiniPanel">
          <div className="commandDashPanelHead"><div><h3>Active Tasks</h3><span>Current work position</span></div><Link href="/work">View all <ChevronRight size={14}/></Link></div>
          <div className="commandDashTaskRows">
            {recent.length ? recent.map(item=>(
              <Link href="/work" key={item.id}><CheckCircle2 size={15}/><span>{item.title}</span><b className={/urgent|high|critical/i.test(item.priority||'')?'high':''}>{item.priority || item.status || 'Open'}</b></Link>
            )) : <div className="commandDashTaskEmpty"><ShieldCheck size={18}/><span>Live work will appear here when the dashboard feed is connected.</span></div>}
          </div>
        </section>
      </div>
    </div>
  );
}
