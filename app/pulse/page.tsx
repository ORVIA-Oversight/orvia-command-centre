'use client';

import { useEffect, useState } from 'react';
import { Shell } from '@/components/Shell';
import { Activity, BarChart3, Brain, CheckCircle2, Eye, Megaphone, Send, ShieldCheck, Sparkles } from 'lucide-react';

type PulseState = {
  source?:string;
  sources?:number;
  signals?:number;
  interpretationsPending?:number;
  campaignsDraft?:number;
  approvals?:number;
  recentSignals?:Array<any>;
  recentCampaigns?:Array<any>;
  warning?:string;
};

const steps = [
  ['LISTEN','Capture authorised market signals',Eye],
  ['LEARN','Separate evidence from interpretation',Brain],
  ['CREATE','Build channel-ready campaign assets',Sparkles],
  ['APPROVE','Keep publication under human control',ShieldCheck],
  ['PUBLISH','Send through approved platform connectors',Send],
  ['MEASURE','Tie attention to enquiries and revenue',BarChart3],
  ['ADAPT','Feed learning back into the next test',Activity],
] as const;

export default function PulsePage(){
  const [data,setData] = useState<PulseState|null>(null);

  useEffect(()=>{
    fetch('/api/pulse',{cache:'no-store'})
      .then(r=>r.json())
      .then(setData)
      .catch(()=>setData({source:'unavailable',warning:'PULSE data could not be loaded.'}));
  },[]);

  return <Shell>
    <div style={{padding:'28px',maxWidth:1500,margin:'0 auto'}}>
      <div style={{display:'flex',justifyContent:'space-between',gap:20,alignItems:'flex-start',flexWrap:'wrap'}}>
        <div>
          <div style={{fontSize:11,fontWeight:900,letterSpacing:'.14em',color:'#6a2e7c'}}>ORVIA PULSE · O → I → A</div>
          <h1 style={{fontSize:42,lineHeight:1.05,margin:'7px 0 10px',color:'#0b2d5c'}}>Listen to the market. Learn what works.</h1>
          <p style={{maxWidth:800,fontSize:16,lineHeight:1.6,color:'#5b6875',margin:0}}>
            PULSE turns authorised market signals and ORVIA campaign performance into evidence-led commercial learning.
            It keeps observation, performance and interpretation separate so IRIS can recommend the next test without presenting AI opinion as fact.
          </p>
        </div>
        <div style={{padding:'10px 14px',border:'1px solid #d9d3ca',borderRadius:999,background:'#fff',fontSize:12,fontWeight:800,color:'#0b2d5c'}}>
          HUMAN APPROVAL REQUIRED FOR PUBLICATION
        </div>
      </div>

      <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))',gap:12,marginTop:26}}>
        {[
          ['Sources',data?.source==='live'?data?.sources:'—'],
          ['Recent signals',data?.source==='live'?data?.signals:'—'],
          ['Interpretations to review',data?.source==='live'?data?.interpretationsPending:'—'],
          ['Draft campaigns',data?.source==='live'?data?.campaignsDraft:'—'],
          ['Content approvals',data?.source==='live'?data?.approvals:'—'],
        ].map(([label,value])=><div key={String(label)} style={{background:'#fff',border:'1px solid #e3ded6',borderRadius:16,padding:18}}>
          <div style={{fontSize:11,color:'#72808d',fontWeight:800}}>{label}</div>
          <div style={{fontSize:32,color:'#0b2d5c',fontWeight:900,marginTop:5}}>{value as any}</div>
        </div>)}
      </div>

      <section style={{marginTop:30}}>
        <div style={{fontSize:11,fontWeight:900,letterSpacing:'.12em',color:'#2f7f86'}}>CONTROLLED LOOP</div>
        <h2 style={{color:'#0b2d5c',margin:'6px 0 14px'}}>Listen → Learn → Create → Approve → Publish → Measure → Adapt</h2>
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(190px,1fr))',gap:12}}>
          {steps.map(([title,copy,Icon],i)=><div key={title} style={{background:'#fff',border:'1px solid #e3ded6',borderRadius:16,padding:17}}>
            <div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}>
              <Icon size={20} color={i<2?'#2f7f86':i<4?'#6a2e7c':'#e34b23'} />
              <span style={{fontSize:10,fontWeight:900,color:'#99a2aa'}}>0{i+1}</span>
            </div>
            <b style={{display:'block',marginTop:13,color:'#0b2d5c'}}>{title}</b>
            <span style={{display:'block',marginTop:6,color:'#687683',fontSize:13,lineHeight:1.45}}>{copy}</span>
          </div>)}
        </div>
      </section>

      <section style={{display:'grid',gridTemplateColumns:'repeat(auto-fit,minmax(320px,1fr))',gap:16,marginTop:28}}>
        <article style={{background:'#fff',border:'1px solid #e3ded6',borderRadius:18,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}><Eye size={19}/><b style={{color:'#0b2d5c'}}>Market signals</b></div>
          <p style={{fontSize:13,color:'#6c7884'}}>Observed information only. No inference is promoted to fact.</p>
          {(data?.recentSignals||[]).length===0
            ? <div style={{padding:'18px 0',color:'#8a949d',fontSize:13}}>No live PULSE source has been connected yet.</div>
            : (data?.recentSignals||[]).slice(0,6).map((x:any)=><div key={x.id} style={{padding:'11px 0',borderTop:'1px solid #eee9e2'}}>
                <b style={{fontSize:13,color:'#253b50'}}>{x.topic||x.signal_type}</b>
                <p style={{fontSize:12,color:'#71808e',margin:'4px 0 0'}}>{x.observed_text||'Observed signal'}</p>
              </div>)
          }
        </article>

        <article style={{background:'#fff',border:'1px solid #e3ded6',borderRadius:18,padding:20}}>
          <div style={{display:'flex',alignItems:'center',gap:9}}><Megaphone size={19}/><b style={{color:'#0b2d5c'}}>Campaigns</b></div>
          <p style={{fontSize:13,color:'#6c7884'}}>Every campaign should trace back to a signal, an ORVIA objective or a deliberate test.</p>
          {(data?.recentCampaigns||[]).length===0
            ? <div style={{padding:'18px 0',color:'#8a949d',fontSize:13}}>No PULSE campaigns have been created yet.</div>
            : (data?.recentCampaigns||[]).slice(0,6).map((x:any)=><div key={x.id} style={{padding:'11px 0',borderTop:'1px solid #eee9e2'}}>
                <div style={{display:'flex',justifyContent:'space-between',gap:10}}>
                  <b style={{fontSize:13,color:'#253b50'}}>{x.title}</b>
                  <span style={{fontSize:10,fontWeight:900,color:'#6a2e7c'}}>{String(x.status).toUpperCase()}</span>
                </div>
                <p style={{fontSize:12,color:'#71808e',margin:'4px 0 0'}}>{x.campaign_code} · {x.primary_product||'ORVIA'}</p>
              </div>)
          }
        </article>
      </section>

      <section style={{marginTop:28,background:'#0b2d5c',color:'#fff',borderRadius:20,padding:22}}>
        <div style={{display:'flex',alignItems:'center',gap:10}}><CheckCircle2 size={20}/><b>Evidence rule</b></div>
        <p style={{margin:'9px 0 0',color:'#d7e2ec',lineHeight:1.6,maxWidth:1000}}>
          PULSE stores three things separately: MARKET SIGNAL — what public/authorised sources actually showed;
          ORVIA PERFORMANCE — what our own activity actually achieved; ORVIA INTERPRETATION — what IRIS or Insight believes the evidence may mean.
        </p>
      </section>

      {data?.warning?<p style={{color:'#9a6700',fontSize:12,marginTop:16}}>{data.warning}</p>:null}
    </div>
  </Shell>;
}
