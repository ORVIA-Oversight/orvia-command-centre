'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

function actionLabel(stage:string){
  if(stage==='implemented') return 'Mark verified';
  if(stage==='verified') return 'Mark effective';
  if(stage==='effective') return 'Mark sustained';
  return 'Close 180-day recheck';
}

export function VerificationActions({id,stage,status,nextRecheckAt}:{id:string;stage:string;status:string;nextRecheckAt:string|null}){
 const router=useRouter();
 const [reference,setReference]=useState('');
 const [busy,setBusy]=useState<string|null>(null);
 const [error,setError]=useState('');
 const closed=['passed','closed'].includes(String(status).toLowerCase());
 const due=!nextRecheckAt||new Date(nextRecheckAt).getTime()<=Date.now()||stage==='implemented';

 async function act(action:'advance'|'fail'){
   setError('');
   if(action==='advance'&&!reference.trim()){setError('Add the evidence or verification reference first.');return;}
   if(action==='fail'&&!reference.trim()){setError('Record the failure reason first.');return;}
   setBusy(action);
   try{
     const payload=action==='advance'
       ? {id,action,evidence_reference:reference.trim()}
       : {id,action,note:reference.trim()};
     const r=await fetch('/api/assurance/update',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify(payload)});
     const data=await r.json().catch(()=>({}));
     if(!r.ok){setError(data.error||'Verification update failed.');return;}
     setReference('');
     router.refresh();
   }finally{setBusy(null);}
 }

 if(closed)return <div className="verificationClosed">VERA cycle complete</div>;

 return <div className="verificationActions">
   <input value={reference} onChange={e=>setReference(e.target.value)} placeholder={stage==='implemented'?'Evidence / implementation reference':'Evidence / recheck reference'} />
   <div>
     <button onClick={()=>act('advance')} disabled={!!busy||!due}>{busy==='advance'?'Saving…':due?actionLabel(stage):'Recheck not due'}</button>
     <button className="secondary" onClick={()=>act('fail')} disabled={!!busy}>{busy==='fail'?'Recording…':'Fail verification'}</button>
   </div>
   {nextRecheckAt&&!due&&<small>Next recheck: {new Date(nextRecheckAt).toLocaleDateString('en-GB')}</small>}
   {error&&<small className="verificationError">{error}</small>}
 </div>;
}
