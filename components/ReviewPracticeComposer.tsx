'use client';

import { useState } from 'react';
import styles from '@/app/review/review.module.css';

export function ReviewPracticeComposer(){
  const [input,setInput]=useState('Review the supplied material, build the chronology, identify contradictions and tell me what remains unresolved.');
  const [response,setResponse]=useState('Practice mode is ready. Use synthetic material only until production access controls are signed off.');
  const [busy,setBusy]=useState(false);

  async function run(){
    if(!input.trim()) return;
    setBusy(true);
    setResponse('IRIS is creating the review plan and worker run...');
    try{
      const res=await fetch('/api/review/practice',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({instruction:input})
      });
      const data=await res.json();
      setResponse(data.answer||data.reason||'The practice run was recorded.');
    }catch{
      setResponse('The practice route could not be reached.');
    }finally{
      setBusy(false);
    }
  }

  return <section className={styles.composer}>
    <div className={styles.composerTop}>
      <div><small>IRIS REVIEW · PRACTICE MODE</small><h3>Give IRIS the instruction.</h3><p>In production this becomes the fast path: understand → retrieve → parallel workers → synthesis → verification → answer.</p></div>
    </div>
    <div className={styles.inputRow}>
      <textarea value={input} onChange={e=>setInput(e.target.value)} aria-label="Review instruction"/>
      <button onClick={run} disabled={busy}>{busy?'RUNNING…':'RUN REVIEW'}</button>
    </div>
    <div className={styles.response}>{response}</div>
  </section>;
}
