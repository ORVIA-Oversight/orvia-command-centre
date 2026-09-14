'use client';

import { useState } from 'react';
import { Bot, Send, Video, CheckCircle2, TriangleAlert } from 'lucide-react';

type IrisReply = { status?: string; answer?: string; reason?: string; model?: string; workId?: string };

export function IrisConsole() {
  const [message, setMessage] = useState('');
  const [reply, setReply] = useState<IrisReply | null>(null);
  const [sending, setSending] = useState(false);

  async function send() {
    const question = message.trim();
    if (!question || sending) return;
    setSending(true);
    setReply(null);
    try {
      const r = await fetch('/api/iris/ask', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ question, context: { pathname: '/production', role: 'founder', lens: 'Production OS' } }),
      });
      const data = await r.json().catch(() => ({ status: 'INCOMPLETE', reason: `IRIS returned HTTP ${r.status}` }));
      setReply(data);
      if (data?.status === 'COMPLETE') setMessage('');
    } catch {
      setReply({ status: 'INCOMPLETE', reason: 'Command could not reach the IRIS same-origin route.' });
    } finally {
      setSending(false);
    }
  }

  return (
    <section style={{display:'grid',gridTemplateColumns:'minmax(0,1.6fr) minmax(260px,.6fr)',gap:16,marginBottom:18}}>
      <div className="productionPanel" style={{padding:18}}>
        <div className="productionPanelHead">
          <div><small>LIVE IRIS CONSOLE</small><h3>Talk to IRIS</h3></div><Bot size={19}/>
        </div>
        <p style={{margin:'0 0 12px',opacity:.72}}>Ask, instruct or create here. The request is written into the controlled ORVIA work queue.</p>
        <div style={{display:'flex',gap:10,alignItems:'stretch'}}>
          <textarea
            value={message}
            onChange={e=>setMessage(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter' && (e.ctrlKey || e.metaKey)) send(); }}
            placeholder="Ask IRIS anything, or give an instruction…"
            style={{minHeight:92,flex:1,resize:'vertical',border:'1px solid #d8d4cd',borderRadius:12,padding:12,font:'inherit'}}
          />
          <button className="buildWorkOrder" onClick={send} disabled={sending || !message.trim()} style={{alignSelf:'stretch',minWidth:140}}>
            <Send size={16}/>{sending?'Sending…':'Send to IRIS'}
          </button>
        </div>
        {reply?.status==='COMPLETE' && <div className="commandNotice" style={{marginTop:12}}><CheckCircle2 size={16}/><div><b>{reply.model||'IRIS'}</b><div>{reply.answer}</div></div></div>}
        {reply && reply.status!=='COMPLETE' && <div className="commandNotice" style={{marginTop:12}}><TriangleAlert size={16}/><div><b>IRIS route failed</b><div>{reply.reason||'No verified response returned.'}</div></div></div>}
      </div>

      <div className="productionPanel" style={{padding:18}}>
        <div className="productionPanelHead">
          <div><small>ARIA PERSONA</small><h3>Visual presence</h3></div><Video size={19}/>
        </div>
        <div style={{minHeight:150,border:'1px dashed #cfc8bc',borderRadius:14,display:'grid',placeItems:'center',textAlign:'center',padding:18,background:'#faf8f4'}}>
          <div><Video size={28}/><b style={{display:'block',marginTop:8}}>Persona video slot ready</b><span style={{display:'block',fontSize:13,opacity:.65,marginTop:4}}>No approved ARIA persona video asset is currently present in the Command repo. This panel will use the approved asset once loaded.</span></div>
        </div>
      </div>
    </section>
  );
}
