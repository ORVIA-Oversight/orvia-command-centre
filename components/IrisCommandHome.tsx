'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Bot, CheckCircle2, ChevronRight, FileText, Headphones,
  Mic, MicOff, Send, ShieldCheck, Sparkles, Users, Volume2, VolumeX,
  Workflow, Brain, HeartPulse, UserRoundCog, MessageSquareText, BadgeCheck, Network
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
  }>;
};

type IrisReply = {
  status?: string;
  answer?: string;
  reason?: string;
};

type ExecutiveBrief = {
  live?: boolean;
  hierarchy?: { managingDirector:string; deputy:string; specialists:number; externalWorkers:number };
  layers?: Array<{code:string;label:string;href:string;status:string;ready:boolean;updatedAt?:string|null}>;
  today?: { scheduledTasks:any[]; openWork:number; approvals:number; mailNeedsJohn:number; mailReplyReady:number; highRiskMail:number };
  workforce?: {
    gateway:string;
    specialistTeams:Array<{code:string;name:string;purpose:string;riskCeiling:string;department?:string;accent?:string|null;avatarUri?:string|null;reportsTo?:string}>;
    externalWorkers:Array<{code:string;name:string;connection:string;riskCeiling:string;department?:string;accent?:string|null;avatarUri?:string|null;reportsTo?:string}>;
    schedules:any[];
  };
};


function chooseBritishVoice(voices: SpeechSynthesisVoice[]) {
  const preferred = ['Sonia', 'Libby', 'Hazel', 'Susan', 'Serena', 'Microsoft Sonia', 'Google UK English Female'];
  return voices.find(v => preferred.some(name => v.name.toLowerCase().includes(name.toLowerCase())))
    || voices.find(v => /en-GB/i.test(v.lang))
    || voices.find(v => /^en/i.test(v.lang))
    || voices[0];
}

export function IrisCommandHome() {
  const [dashboard, setDashboard] = useState<DashboardState | null>(null);
  const [command, setCommand] = useState('');
  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceReplies, setVoiceReplies] = useState(true);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [executive, setExecutive] = useState<ExecutiveBrief | null>(null);
  const [targetAgent, setTargetAgent] = useState<string>('IRIS');

  useEffect(() => {
    fetch('/api/dashboard', { cache: 'no-store' })
      .then(r => r.json())
      .then(setDashboard)
      .catch(() => setDashboard({ source: 'unavailable' }));
    fetch('/api/iris/executive', { cache: 'no-store' })
      .then(r => r.json())
      .then(setExecutive)
      .catch(() => setExecutive({ live: false }));
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

  const needsAttention = useMemo(() => {
    const approvals = dashboard?.approvals ?? 0;
    const issues = dashboard?.systemIssues ?? 0;
    return approvals + issues;
  }, [dashboard]);

  function speak(text: string) {
    if (!voiceReplies || typeof window === 'undefined' || !('speechSynthesis' in window) || !text) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || 'en-GB';
    if (voice) utterance.voice = voice;
    utterance.rate = 0.98;
    utterance.pitch = 1;
    window.speechSynthesis.speak(utterance);
  }

  function stopSpeaking() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  }

  function startListening() {
    if (typeof window === 'undefined') return;
    const w = window as typeof window & {
      SpeechRecognition?: new () => any;
      webkitSpeechRecognition?: new () => any;
    };
    const Recognition = w.SpeechRecognition || w.webkitSpeechRecognition;
    if (!Recognition) {
      setReply('Voice input is not available in this browser yet. You can still type to IRIS.');
      return;
    }

    const recognition = new Recognition();
    recognition.lang = 'en-GB';
    recognition.interimResults = false;
    recognition.continuous = false;
    recognition.onstart = () => setListening(true);
    recognition.onend = () => setListening(false);
    recognition.onerror = () => {
      setListening(false);
      setReply('I could not hear that clearly. Try again or type the request.');
    };
    recognition.onresult = (event: any) => {
      const transcript = event?.results?.[0]?.[0]?.transcript || '';
      if (transcript) setCommand(transcript);
    };
    recognition.start();
  }

  async function askIris(text?: string) {
    const question = (text ?? command).trim();
    if (!question || sending) return;

    setSending(true);
    setReply('');
    try {
      const r = await fetch('/api/iris/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          question,
          context: {
            pathname: '/',
            role: 'founder',
            lens: 'Command',
            experience: 'single-conversation',
            surface: 'IRIS'
          },
          targetAgent
        })
      });

      const data: IrisReply = await r.json().catch(() => ({
        status: 'INCOMPLETE',
        reason: 'IRIS did not return a readable response.'
      }));

      const message = data.status === 'COMPLETE' && data.answer
        ? data.answer
        : (data.reason || 'IRIS could not verify the answer.');

      setReply(message);
      setCommand('');
      speak(message);
      fetch('/api/dashboard', { cache: 'no-store' }).then(x => x.json()).then(setDashboard).catch(() => {});
      fetch('/api/iris/executive', { cache: 'no-store' }).then(x => x.json()).then(setExecutive).catch(() => {});
    } catch {
      setReply('IRIS is not connected right now. Your request has not been sent anywhere else.');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="irisCommand">
      <header className="irisCommandTop">
        <div>
          <small>ORVIA COMMAND · HEALTH & SOCIAL CARE PILOT</small>
          <h1>Command</h1>
        </div>
        <div className="irisCommandTopActions">
          <button
            className="irisVoiceToggle"
            onClick={() => {
              if (voiceReplies) stopSpeaking();
              setVoiceReplies(v => !v);
            }}
            title="Toggle spoken replies"
          >
            {voiceReplies ? <Volume2 size={17}/> : <VolumeX size={17}/>}
            <span>{voiceReplies ? 'Voice on' : 'Voice off'}</span>
          </button>
          <Link href="/work" className="irisAttention">
            <span>{needsAttention}</span>
            <div><b>Needs attention</b><small>Approvals & exceptions</small></div>
          </Link>
        </div>
      </header>

      <section className="irisHeroPanel">
        <div className="irisPresence">
          <div className={`irisAvatar ${sending ? 'isThinking' : ''} ${listening ? 'isListening' : ''}`}>
            <div className="irisAvatarFace" aria-label="IRIS AI assistant">
              <Sparkles size={30}/>
            </div>
            <span className="irisPulse p1"/>
            <span className="irisPulse p2"/>
            <span className="irisPulse p3"/>
          </div>
          <div className="irisIdentity">
            <div className="irisNameRow"><h2>IRIS</h2><span>Deputy · AI Operations</span></div>
            <p>You are Managing Director. IRIS is your deputy: she can allocate the work automatically, or you can speak directly to a department or worker and IRIS keeps the overall picture coordinated.</p>
            <div className="irisTrustLine"><ShieldCheck size={15}/><span>Human authority retained for safeguarding, clinical and consequential decisions.</span></div>
          </div>
        </div>

        <div className="irisConversation">
          {reply ? (
            <div className="irisReply">
              <div className="irisReplyHead"><Bot size={17}/><b>IRIS</b><small>Just now</small></div>
              <p>{reply}</p>
            </div>
          ) : (
            <div className="irisWelcome">
              <span className="irisWelcomeIcon"><Sparkles size={18}/></span>
              <div>
                <b>Good to see you.</b>
                <p>Ask me anything about the business, give me a task, or ask what needs attention.</p>
              </div>
            </div>
          )}

          <div className="irisComposer">
            <textarea
              value={command}
              onChange={e => setCommand(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  askIris();
                }
              }}
              placeholder="Message IRIS…"
              rows={2}
            />
            <div style={{padding:'0 10px 8px',display:'flex',gap:7,alignItems:'center',flexWrap:'wrap'}}>
              <span style={{fontSize:8,fontWeight:900,letterSpacing:'.08em',color:'#68798a'}}>ASSIGN TO</span>
              <select value={targetAgent} onChange={e=>setTargetAgent(e.target.value)} style={{border:'1px solid #ddd6cc',borderRadius:8,padding:'7px 9px',fontSize:9,background:'#faf8f4',color:'#0b2450'}}>
                <option value="IRIS">IRIS — allocate for me</option>
                {(executive?.workforce?.specialistTeams||[]).map(x=><option key={x.code} value={x.code}>{x.name}</option>)}
                {(executive?.workforce?.externalWorkers||[]).map(x=><option key={x.code} value={x.code}>{x.name}</option>)}
              </select>
            </div>
            <div className="irisComposerBar">
              <div className="irisComposerLeft">
                <button onClick={startListening} className={listening ? 'active' : ''} title="Speak to IRIS">
                  {listening ? <MicOff size={17}/> : <Mic size={17}/>}
                  <span>{listening ? 'Listening…' : 'Talk'}</span>
                </button>
                <Link href="/library"><Brain size={16}/><span>Knowledge</span></Link>
              </div>
              <button className="irisSend" onClick={() => askIris()} disabled={!command.trim() || sending}>
                {sending ? <><span className="irisSpinner"/>Working</> : <><Send size={17}/>Send</>}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="irisQuickActions">
        <button onClick={() => askIris('Brief me on what needs my attention today.')}>Brief me</button>
        <button onClick={() => askIris('Show me anything overdue, blocked or waiting for approval.')}>What is stuck?</button>
        <button onClick={() => askIris('Review current health and social care priorities and tell me the top three risks.')}>Top risks</button>
        <button onClick={() => askIris('Prepare a concise management handover from current work and evidence.')}>Prepare handover</button>
        <button onClick={() => askIris('Research this using ORVIA Reach and return the strongest sourced findings, clearly separating verified facts from indications.')}>Research with ORVIA Reach</button>
      </section>

      <section className="irisSection">
        <div className="irisSectionHead">
          <div><small>YOUR WORKFORCE</small><h3>You lead. IRIS coordinates. Teams execute.</h3></div>
          <Link href="/workforce">Open workforce <ChevronRight size={16}/></Link>
        </div>
        <div className="irisQuickActions" style={{marginBottom:12}}>
          <button onClick={()=>askIris('Give me my full managing director brief: diary, mail, work, sales, risks and approvals.')}>MD daily brief</button>
          <button onClick={()=>{setTargetAgent('SALES-01');setCommand('Review sales, prospects, follow-ups and next conversations.');}}>Sales team</button>
          <button onClick={()=>{setTargetAgent('FINANCE-01');setCommand('Review finance, cash, invoices and commercial priorities.');}}>Finance team</button>
          <button onClick={()=>{setTargetAgent('SAFEGUARD-01');setCommand('Review safeguarding work and surface only matters needing human attention.');}}>Safeguarding</button>
        </div>
        <div className="irisTeamGrid">
          {(executive?.workforce?.specialistTeams||[]).slice(0,9).map((agent) => (
            <button key={agent.code} className="irisAgentCard" onClick={() => { setTargetAgent(agent.code); setCommand(`${agent.name}, review your area and tell me what needs attention.`); }}>
              <div className="irisAgentAvatar" style={{background:agent.accent||undefined}}>
                {agent.avatarUri ? <img src={agent.avatarUri} alt="" /> : <span>{agent.name.split(' ').filter(Boolean).slice(0,2).map(x=>x[0]).join('').toUpperCase()}</span>}
              </div>
              <div className="irisAgentCopy"><b>{agent.name}</b><span>{agent.department||'Specialist'}</span><small>{agent.purpose}</small></div>
              <ArrowRight size={16}/>
            </button>
          ))}
        </div>
      </section>

      <section className="irisLowerGrid">
        <article className="irisStatusCard">
          <div className="irisSectionHead compact"><div><small>OPERATING LAYERS</small><h3>Connected into Command</h3></div><Network size={18}/></div>
          <div className="irisStatusRows">
            {(executive?.layers||[]).slice(0,7).map(layer=><div key={layer.code}><span>{layer.label}</span><b style={{fontSize:9}}>{layer.ready?'LIVE':String(layer.status).toUpperCase()}</b></div>)}
          </div>
          <Link href="/systems">Open systems & access <ChevronRight size={15}/></Link>
        </article>

        <article className="irisStatusCard">
          <div className="irisSectionHead compact"><div><small>LIVE POSITION</small><h3>Business at a glance</h3></div><Workflow size={18}/></div>
          <div className="irisStatusRows">
            <div><span><CheckCircle2 size={15}/>Open work</span><b>{dashboard?.source === 'live' ? dashboard?.openWork ?? 0 : '—'}</b></div>
            <div><span><ShieldCheck size={15}/>Needs approval</span><b>{dashboard?.source === 'live' ? dashboard?.approvals ?? 0 : '—'}</b></div>
            <div><span><Users size={15}/>System exceptions</span><b>{dashboard?.source === 'live' ? dashboard?.systemIssues ?? 0 : '—'}</b></div>
          </div>
          <Link href="/work">Open work queue <ChevronRight size={15}/></Link>
        </article>

        <article className="irisStatusCard">
          <div className="irisSectionHead compact"><div><small>HOW IT WORKS</small><h3>One conversation. Many capabilities.</h3></div><Headphones size={18}/></div>
          <div className="irisFlow">
            <span>YOU</span><i/>
            <span className="active">IRIS</span><i/>
            <span>Specialist</span><i/>
            <span>Verify</span><i/>
            <span>Action</span>
          </div>
          <p>IRIS stays your front door. Specialist agents, skills, evidence checks and approvals run underneath without forcing you through multiple chat windows.</p>
        </article>
      </section>
    </div>
  );
}
