'use client';
import { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, MessageSquarePlus, Send, TriangleAlert, Volume2, VolumeX } from 'lucide-react';

type DashboardState={source?:string;openTasks?:number;approvals?:number;warning?:string;outbound?:{campaigns?:Array<{id:string;name:string;status:string;metrics?:{eligible:number;attempts:number;bookings:number}}>}};
type IrisState={status?:string;answer?:string;reason?:string};
type ChatMessage={id:string;role:'user'|'iris';text:string;status?:'ok'|'warn';createdAt:number};
type Thread={id:string;title:string;messages:ChatMessage[];updatedAt:number};

const starterThread:Thread={
 id:'today',
 title:'Today with IRIS',
 updatedAt:Date.now(),
 messages:[{id:'welcome',role:'iris',text:'Good evening John. This is your single Command conversation. Ask me what matters, tell me what to review, or tell me to deal with what I can.',status:'ok',createdAt:Date.now()}]
};

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
   const saved=window.localStorage.getItem('orvia-command-threads-v1');
   if(saved){
    const parsed=JSON.parse(saved) as Thread[];
    if(Array.isArray(parsed)&&parsed.length){setThreads(parsed);setActiveThreadId(parsed[0].id);}
   }
  }catch{}
 },[]);

 useEffect(()=>{
  try{window.localStorage.setItem('orvia-command-threads-v1',JSON.stringify(threads.slice(0,30)));}catch{}
 },[threads]);

 const activeThread=threads.find(t=>t.id===activeThreadId)??threads[0];
 const approvals=dashboard?.source==='live'?dashboard.approvals??0:null;
 const openTasks=dashboard?.source==='live'?dashboard.openTasks??0:null;
 const campaigns=dashboard?.outbound?.campaigns??[];
 const eligible=campaigns.reduce((n,c)=>n+(c.metrics?.eligible??0),0);

 const statusLine=useMemo(()=>{
  if(dashboard?.source!=='live') return 'Live work state is not verified yet. I will not guess.';
  if((approvals??0)>0) return `${approvals} decision${approvals===1?' needs':'s need'} you. ${openTasks??0} active work item${openTasks===1?'':'s'} remain in the background.`;
  return `Nothing currently needs your approval. ${openTasks??0} active work item${openTasks===1?'':'s'} can continue in the background.`;
 },[dashboard,approvals,openTasks]);

 function speak(text:string){
  if(!voiceOn || typeof window==='undefined' || !('speechSynthesis' in window) || !text) return;
  window.speechSynthesis.cancel();
  const u=new SpeechSynthesisUtterance(text);
  const voices=window.speechSynthesis.getVoices();
  const preferred=voices.find(v=>/en-GB/i.test(v.lang))||voices[0];
  if(preferred)u.voice=preferred;
  u.rate=1;u.pitch=1;
  window.speechSynthesis.speak(u);
 }

 function addMessage(threadId:string,message:ChatMessage){
  setThreads(current=>current.map(t=>t.id===threadId?{...t,messages:[...t.messages,message],updatedAt:Date.now()}:t).sort((a,b)=>b.updatedAt-a.updatedAt));
 }

 function newThread(){
  const id=`thread-${Date.now()}`;
  const next:Thread={id,title:'New conversation',updatedAt:Date.now(),messages:[{id:`welcome-${id}`,role:'iris',text:'New conversation started. What do you want me to deal with?',status:'ok',createdAt:Date.now()}]};
  setThreads(current=>[next,...current]);
  setActiveThreadId(id);
  setCommand('');
 }

 async function sendToIris(){
  const question=command.trim();
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
   const r=await fetch('/api/iris/ask',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({question,context:{pathname:'/command',role:'founder',lens:'Command Centre',transcript}})});
   const data:IrisState=await r.json().catch(()=>({status:'INCOMPLETE',reason:'I need to verify the connection before answering reliably.'}));
   const text=data.status==='COMPLETE'&&data.answer?data.answer:(data.reason||'I do not have enough verified information to answer that reliably.');
   addMessage(threadId,{id:`i-${Date.now()}`,role:'iris',text,status:data.status==='COMPLETE'?'ok':'warn',createdAt:Date.now()});
   if(data.status==='COMPLETE')speak(text);
  }catch{
   addMessage(threadId,{id:`i-${Date.now()}`,role:'iris',text:'I cannot verify the Command connection right now, so I will not guess.',status:'warn',createdAt:Date.now()});
  }finally{setSending(false);}
 }

 function onKeyDown(e:React.KeyboardEvent<HTMLTextAreaElement>){
  if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendToIris();}
 }

 return <div className="commandWorkspace">
  <aside className="commandThreads">
   <div className="threadHead"><div><small>ORVIA COMMAND</small><b>Conversations</b></div><button onClick={newThread} title="New conversation"><MessageSquarePlus size={17}/></button></div>
   <div className="threadSearchHint">One place for every conversation with IRIS.</div>
   <div className="threadList">
    {threads.map(t=><button key={t.id} className={t.id===activeThreadId?'active':''} onClick={()=>setActiveThreadId(t.id)}><span className="threadDot"/><span><b>{t.title}</b><small>{t.messages.length} messages</small></span></button>)}
   </div>
  </aside>

  <main className="commandConversation">
   <header className="conversationHeader">
    <div><small>IRIS · CHIEF OF STAFF</small><h2>{activeThread?.title||'Command'}</h2><p>{statusLine}</p></div>
    <div className="conversationStatus"><span>Needs you <b>{approvals??'—'}</b></span><span>Open work <b>{openTasks??'—'}</b></span><span>Sales <b>{eligible||'—'}</b></span></div>
   </header>

   <section className="messageStream">
    {activeThread?.messages.map(message=><article className={`chatMessage ${message.role} ${message.status==='warn'?'warn':''}`} key={message.id}>
      <div className="chatAvatar">{message.role==='user'?'JM':'IRIS'}</div>
      <div className="chatBody"><div className="chatMeta"><b>{message.role==='user'?'John':'IRIS'}</b>{message.status==='warn'?<TriangleAlert size={14}/>:message.role==='iris'?<CheckCircle2 size={14}/>:null}</div><p>{message.text}</p></div>
    </article>)}
    {sending&&<article className="chatMessage iris"><div className="chatAvatar">IRIS</div><div className="chatBody"><div className="chatMeta"><b>IRIS</b></div><p>Working on that…</p></div></article>}
   </section>

   <footer className="chatComposer">
    <textarea value={command} onChange={e=>setCommand(e.target.value)} onKeyDown={onKeyDown} placeholder="Message IRIS…" aria-label="Message IRIS" />
    <div className="composerActions"><span>Enter to send · Shift+Enter for a new line</span><div><button className="voiceButton" type="button" onClick={()=>{setVoiceOn(v=>!v);if(voiceOn&&typeof window!=='undefined')window.speechSynthesis?.cancel();}}>{voiceOn?<Volume2 size={16}/>:<VolumeX size={16}/>}</button><button className="sendButton" onClick={sendToIris} disabled={sending||!command.trim()}><Send size={16}/>{sending?'Working':'Send'}</button></div></div>
   </footer>
  </main>
 </div>;
}
