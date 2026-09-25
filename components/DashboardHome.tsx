'use client';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquarePlus, Send, TriangleAlert, Volume2, VolumeX } from 'lucide-react';

type DashboardState={
  source?:string;
  openWork?:number|null;
  approvals?:number|null;
  estate?:number|null;
  estateReview?:number|null;
  systemIssues?:number|null;
  clients?:number|null;
  warning?:string;
  recentWork?:Array<{id:string;title:string;status:string;priority:string;approval_required:boolean;source_reference?:string|null}>;
};
type IrisState={status?:string;answer?:string;reason?:string;authority?:string;approvalRequired?:boolean};
type ChatMessage={id:string;role:'user'|'iris';text:string;status?:'ok'|'warn';createdAt:number};
type Thread={id:string;title:string;messages:ChatMessage[];updatedAt:number};

const starterThread:Thread={
 id:'today',
 title:'Today with IRIS',
 updatedAt:Date.now(),
 messages:[{id:'welcome',role:'iris',text:'Good evening John. Tell me what you need. I will read live ORVIA state first, create work only when you actually ask for action, and hold anything above delegated authority.',status:'ok',createdAt:Date.now()}]
};

const quickPrompts=[
 'What needs my attention today?',
 'Give me a live ORVIA estate summary.',
 'Which systems are not verified?',
 'Show me current blockers.'
];

export function DashboardHome(){
 const [command,setCommand]=useState('');
 const [sending,setSending]=useState(false);
 const [voiceOn,setVoiceOn]=useState(true);
 const [dashboard,setDashboard]=useState<DashboardState|null>(null);
 const [threads,setThreads]=useState<Thread[]>([starterThread]);
 const [activeThreadId,setActiveThreadId]=useState('today');

 useEffect(()=>{
  fetch('/api/dashboard',{cache:'no-store'}).then(r=>r.json()).then(setDashboard).catch(()=>setDashboard({source:'unavailable'}));
  try{
   const saved=window.localStorage.getItem('orvia-command-threads-v2');
   if(saved){
    const parsed=JSON.parse(saved) as Thread[];
    if(Array.isArray(parsed)&&parsed.length){setThreads(parsed);setActiveThreadId(parsed[0].id);}
   }
  }catch{}
 },[]);

 useEffect(()=>{
  try{window.localStorage.setItem('orvia-command-threads-v2',JSON.stringify(threads.slice(0,30)));}catch{}
 },[threads]);

 const activeThread=threads.find(t=>t.id===activeThreadId)??threads[0];
 const live=dashboard?.source==='live';

 const statusLine=useMemo(()=>{
  if(!live) return 'Live work state is not verified yet. IRIS will not guess.';
  const approvals=dashboard?.approvals??0;
  const open=dashboard?.openWork??0;
  const issues=dashboard?.systemIssues??0;
  if(approvals>0) return `${approvals} decision${approvals===1?' needs':'s need'} you. ${open} active work item${open===1?'':'s'} remain recorded.`;
  if(issues>0) return `Nothing currently needs approval. ${issues} system connection${issues===1?'':'s'} still need attention.`;
  return `Nothing currently needs your approval. ${open} active work item${open===1?'':'s'} remain recorded.`;
 },[dashboard,live]);

 function speak(text:string){
  if(!voiceOn||typeof window==='undefined'||!('speechSynthesis' in window)||!text)return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const voices=window.speechSynthesis.getVoices();
  const preferred=voices.find(v=>/en-GB/i.test(v.lang))||voices[0];
  if(preferred)u.voice=preferred;
  u.rate=1;u.pitch=1;window.speechSynthesis.speak(u);
 }

 function addMessage(threadId:string,message:ChatMessage){
  setThreads(current=>current.map(t=>t.id===threadId?{...t,messages:[...t.messages,message],updatedAt:Date.now()}:t).sort((a,b)=>b.updatedAt-a.updatedAt));
 }

 function newThread(){
  const id=`thread-${Date.now()}`;
  const next:Thread={id,title:'New conversation',updatedAt:Date.now(),messages:[{id:`welcome-${id}`,role:'iris',text:'New conversation started. What do you want me to deal with?',status:'ok',createdAt:Date.now()}]};
  setThreads(current=>[next,...current]);setActiveThreadId(id);setCommand('');
 }

 async function sendQuestion(raw?:string){
  const question=(raw??command).trim();
  if(!question||!activeThread)return;
  const threadId=activeThread.id;
  const firstUserMessage=!activeThread.messages.some(m=>m.role==='user');
  addMessage(threadId,{id:`u-${Date.now()}`,role:'user',text:question,createdAt:Date.now()});
  if(firstUserMessage){
   const title=question.length>42?`${question.slice(0,42)}…`:question;
   setThreads(current=>current.map(t=>t.id===threadId?{...t,title}:t));
  }
  setCommand('');setSending(true);
  try{
   const transcript=activeThread.messages.slice(-10).map(m=>`${m.role==='user'?'John':'IRIS'}: ${m.text}`).join('\n');
   const r=await fetch('/api/iris/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,context:{pathname:'/command',role:'founder',lens:'Command',transcript}})});
   const data:IrisState=await r.json().catch(()=>({status:'INCOMPLETE',reason:'I need to verify the connection before answering reliably.'}));
   const text=data.status==='COMPLETE'&&data.answer?data.answer:(data.reason||'I do not have enough verified information to answer that reliably.');
   addMessage(threadId,{id:`i-${Date.now()}`,role:'iris',text,status:data.status==='COMPLETE'?'ok':'warn',createdAt:Date.now()});
   if(data.status==='COMPLETE')speak(text);
   fetch('/api/dashboard',{cache:'no-store'}).then(x=>x.json()).then(setDashboard).catch(()=>{});
  }catch{
   addMessage(threadId,{id:`i-${Date.now()}`,role:'iris',text:'I cannot verify the Command connection right now, so I will not guess.',status:'warn',createdAt:Date.now()});
  }finally{setSending(false);}
 }

 function onKeyDown(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendQuestion();}
 }

 return <div className="commandWorkspace">
  <aside className="commandThreads">
   <div className="threadHead"><div><small>ORVIA COMMAND</small><b>Conversations</b></div><button onClick={newThread} title="New conversation"><MessageSquarePlus size={17}/></button></div>
   <div className="threadSearchHint">One place to talk to ORVIA through IRIS.</div>
   <div className="threadList">
    {threads.map(t=><button key={t.id} className={t.id===activeThreadId?'active':''} onClick={()=>setActiveThreadId(t.id)}><span className="threadDot"/><span><b>{t.title}</b><small>{t.messages.length} messages</small></span></button>)}
   </div>
  </aside>

  <main className="commandConversation">
   <header className="conversationHeader">
    <div><small>IRIS · ORVIA CONDUCTOR</small><h2>{activeThread?.title||'Command'}</h2><p>{statusLine}</p></div>
    <div className="conversationStatus">
      <span>Needs you <b>{live?dashboard?.approvals??0:'—'}</b></span>
      <span>Open work <b>{live?dashboard?.openWork??0:'—'}</b></span>
      <span>Estate <b>{live?dashboard?.estate??0:'—'}</b></span>
      <span>System issues <b>{live?dashboard?.systemIssues??0:'—'}</b></span>
    </div>
   </header>

   <div className="quickPrompts">{quickPrompts.map(q=><button key={q} onClick={()=>sendQuestion(q)} disabled={sending}>{q}</button>)}</div>

   <section className="messageStream">
    {activeThread?.messages.map(message=><article className={`chatMessage ${message.role} ${message.status==='warn'?'warn':''}`} key={message.id}>
      <div className="chatAvatar">{message.role==='user'?'JM':'IRIS'}</div>
      <div className="chatBody"><div className="chatMeta"><b>{message.role==='user'?'John':'IRIS'}</b>{message.status==='warn'?<TriangleAlert size={14}/>:message.role==='iris'?<CheckCircle2 size={14}/>:null}</div><p>{message.text}</p></div>
    </article>)}
    {sending&&<article className="chatMessage iris"><div className="chatAvatar">IRIS</div><div className="chatBody"><div className="chatMeta"><b>IRIS</b></div><p>Checking live ORVIA state…</p></div></article>}
   </section>

   <footer className="chatComposer">
    <textarea value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={onKeyDown} placeholder="Tell IRIS what you need…" aria-label="Message IRIS" />
    <div className="composerActions"><span>Enter to send · Shift+Enter for a new line</span><div><button className="voiceButton" type="button" onClick={()=>{setVoiceOn(v=>!v);if(voiceOn&&typeof window!=='undefined')window.speechSynthesis?.cancel();}}>{voiceOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button><button className="sendButton" onClick={()=>sendQuestion()} disabled={sending||!command.trim()}><Send size={16}/>{sending?'Working':'Send'}</button></div></div>
   </footer>
  </main>
 </div>;
}
