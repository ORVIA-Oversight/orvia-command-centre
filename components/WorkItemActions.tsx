'use client';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function WorkItemActions({id,kind,status,approvalRequired}:{id:string;kind:'task'|'work';status:string;approvalRequired:boolean}){
  const router=useRouter();
  const [busy,setBusy]=useState<string|null>(null);
  const lower=String(status||'').toLowerCase();
  const complete=['completed','closed','done','cancelled'].includes(lower);

  async function act(action:'approve'|'hold'|'complete'|'reopen'){
    setBusy(action);
    try{
      const r=await fetch('/api/work/update',{method:'PATCH',headers:{'content-type':'application/json'},body:JSON.stringify({id,kind,action})});
      if(r.ok) router.refresh();
    }finally{setBusy(null);}
  }

  return <div className="workActions">
    {approvalRequired&&!complete&&<button onClick={()=>act('approve')} disabled={!!busy}>{busy==='approve'?'Approving…':'Approve'}</button>}
    {!complete&&lower!=='blocked'&&<button className="secondary" onClick={()=>act('hold')} disabled={!!busy}>{busy==='hold'?'Holding…':'Hold'}</button>}
    {!complete&&<button className="secondary" onClick={()=>act('complete')} disabled={!!busy}>{busy==='complete'?'Closing…':'Complete'}</button>}
    {complete&&<button className="secondary" onClick={()=>act('reopen')} disabled={!!busy}>{busy==='reopen'?'Reopening…':'Reopen'}</button>}
  </div>;
}
