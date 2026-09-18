'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Activity, AlertTriangle, BatteryCharging, Boxes, CheckCircle2, Clock3,
  Crosshair, Map, Radio, Router, Satellite, ShieldCheck, Signal,
  Tablet, Users, Wifi, WifiOff
} from 'lucide-react';

type LiveAsset={
  id:string; callsign?:string; kind?:string; status?:string; team?:string;
  battery?:number|null; network?:string; detail?:string; lastSeen?:string;
  lat?:number|null; lon?:number|null; x?:number|null; y?:number|null;
};
type StatusPayload={source?:string;assets?:LiveAsset[]};

const demoAssets:LiveAsset[]=[
 {id:'R-01',callsign:'SEARCH 01',kind:'RADIO',status:'PLANNED',team:'Alpha',battery:100,network:'GPS / DMR',detail:'Partner-supplied GPS radio',lastSeen:'Not deployed',x:25,y:32},
 {id:'T-01',callsign:'ALPHA LEAD',kind:'TABLET',status:'PLANNED',team:'Alpha',battery:100,network:'ATAK / Wi-Fi',detail:'Rugged field tablet',lastSeen:'Not deployed',x:31,y:38},
 {id:'M-01',callsign:'MESH 01',kind:'MESH',status:'PLANNED',team:'Alpha',battery:100,network:'LoRa',detail:'Meshtastic node',lastSeen:'Not deployed',x:38,y:50},
 {id:'V-01',callsign:'VEHICLE 01',kind:'VEHICLE',status:'PLANNED',team:'Command',battery:100,network:'GNSS / LTE',detail:'Vehicle tracker',lastSeen:'Not deployed',x:68,y:62},
 {id:'CP-01',callsign:'COMMAND POST',kind:'GATEWAY',status:'PLANNED',team:'Command',battery:100,network:'Starlink / LTE / Mesh',detail:'Rapid deployment command case',lastSeen:'Not deployed',x:52,y:44},
];

const sectors=[
 {id:'A',label:'Sector A',state:'READY',note:'Awaiting tasking'},
 {id:'B',label:'Sector B',state:'READY',note:'Awaiting tasking'},
 {id:'C',label:'Sector C',state:'PRIORITY',note:'Search manager allocation required'},
 {id:'D',label:'Sector D',state:'READY',note:'Awaiting tasking'},
];

const readiness=[
 {name:'Command software',state:'BUILT',owner:'ORVIA',icon:ShieldCheck,note:'Command module and telemetry API'},
 {name:'Satellite backhaul',state:'PARTNER',owner:'Partner-supplied',icon:Satellite,note:'Hire/managed Starlink initially'},
 {name:'GPS radio fleet',state:'PARTNER',owner:'Partner-supplied',icon:Radio,note:'Integrate GPS-capable radios'},
 {name:'Rugged field tablets',state:'PLANNED',owner:'Planned purchase',icon:Tablet,note:'ATAK / ORVIA field devices'},
 {name:'Meshtastic mesh',state:'PLANNED',owner:'Planned purchase',icon:Signal,note:'LoRa resilience layer'},
 {name:'Power & network case',state:'PLANNED',owner:'Planned build',icon:Router,note:'Router, failover, UPS and charging'},
];

const supplierModel=[
 ['NOW','Hire / managed','Use specialist Starlink and radio providers for live jobs. ORVIA supplies Command, configuration and operating process.'],
 ['PROVE','Standardise','Record every deployment, fault, coverage issue and equipment requirement in Command.'],
 ['BUY','ORVIA fleet','Purchase proven hardware configurations from deployment revenue rather than guessing upfront.'],
 ['SCALE','Full hire kits','Pre-packed satellite, radio, tablet, mesh, power and command kits ready for repeat deployments.'],
];

function AssetIcon({kind}:{kind?:string}){
 const cls='deployAssetIcon';
 if(kind==='RADIO')return <Radio className={cls} size={15}/>;
 if(kind==='TABLET')return <Tablet className={cls} size={15}/>;
 if(kind==='MESH')return <Signal className={cls} size={15}/>;
 if(kind==='GATEWAY')return <Satellite className={cls} size={15}/>;
 return <Crosshair className={cls} size={15}/>;
}

function statusClass(status?:string){
 const s=(status||'').toUpperCase();
 if(s==='EMERGENCY'||s==='LOST')return 'danger';
 if(s==='LIVE'||s==='ONLINE')return 'live';
 if(s==='MESH ONLY'||s==='STALE')return 'warn';
 return 'planned';
}

export function DeployOps(){
 const [status,setStatus]=useState<StatusPayload>({source:'loading',assets:[]});
 const [selected,setSelected]=useState<string>('CP-01');

 useEffect(()=>{
  fetch('/api/deploy/status',{cache:'no-store'}).then(r=>r.json()).then(setStatus).catch(()=>setStatus({source:'unavailable',assets:[]}));
 },[]);

 const isLive=status.source==='live'&&(status.assets?.length??0)>0;
 const assets=isLive?status.assets??[]:demoAssets;
 const selectedAsset=assets.find(a=>a.id===selected)??assets[0];
 const liveCount=assets.filter(a=>['LIVE','ONLINE','MESH ONLY'].includes((a.status||'').toUpperCase())).length;
 const emergency=assets.filter(a=>(a.status||'').toUpperCase()==='EMERGENCY').length;
 const displayState=isLive?'LIVE VERIFIED':'BUILT NOT DEPLOYED';

 const plotted=useMemo(()=>assets.map((a,i)=>({
  ...a,
  px:typeof a.x==='number'?a.x:20+((i*17)%65),
  py:typeof a.y==='number'?a.y:25+((i*13)%55)
 })),[assets]);

 return <div className="deployOps">
  <section className="deployHero">
   <div>
    <div className="eyebrow">ORVIA RAPID DEPLOYMENT & SEARCH SUPPORT</div>
    <h2>One operating picture from command post to field team.</h2>
    <p>Satellite backhaul, GPS radios, rugged tablets, Meshtastic, ATAK-compatible telemetry and search-sector accountability in one controlled ORVIA environment.</p>
   </div>
   <div className={'deployEvidence '+(isLive?'verified':'built')}><Activity size={17}/><div><small>EVIDENCE STATE</small><b>{displayState}</b></div></div>
  </section>

  <section className="deployMetricGrid">
   <article><span><Users size={17}/> Field assets</span><strong>{assets.length}</strong><small>{isLive?'Reporting into Command':'Demonstration inventory'}</small></article>
   <article><span><Signal size={17}/> Live contacts</span><strong>{isLive?liveCount:'—'}</strong><small>{isLive?'Current radio / device contacts':'Awaiting first field check-in'}</small></article>
   <article><span><AlertTriangle size={17}/> Emergencies</span><strong>{isLive?emergency:'—'}</strong><small>{isLive?'Active emergency states':'No live incident feed'}</small></article>
   <article><span><Satellite size={17}/> Backhaul</span><strong>{isLive?'FEED':'PARTNER'}</strong><small>{isLive?'Telemetry received':'Hire first · own later'}</small></article>
  </section>

  <section className="deployGridMain">
   <article className="deployPanel deployMapPanel">
    <header><div><small>COMMON OPERATING PICTURE</small><h3>Deployment map</h3></div><span className={'deployPill '+(isLive?'live':'planned')}>{isLive?'LIVE FEED':'SIMULATION'}</span></header>
    <div className="deployMap">
     <div className="mapGrid"/>
     <div className="mapRoad roadOne"/><div className="mapRoad roadTwo"/>
     <div className="sectorBox sectorA"><b>A</b><span>READY</span></div>
     <div className="sectorBox sectorB"><b>B</b><span>READY</span></div>
     <div className="sectorBox sectorC"><b>C</b><span>PRIORITY</span></div>
     <div className="sectorBox sectorD"><b>D</b><span>READY</span></div>
     {plotted.map(a=><button key={a.id} onClick={()=>setSelected(a.id)} className={'mapAsset '+statusClass(a.status)+(selected===a.id?' selected':'')} style={{left:a.px+'%',top:a.py+'%'}} title={a.callsign||a.id}><AssetIcon kind={a.kind}/><span>{a.callsign||a.id}</span></button>)}
     <div className="mapLegend"><span><i className="lgLive"/>Live</span><span><i className="lgWarn"/>Mesh / stale</span><span><i className="lgPlan"/>Planned</span><span><i className="lgDanger"/>Emergency</span></div>
    </div>
    <div className="assetDetail">
     <div><small>SELECTED ASSET</small><b>{selectedAsset?.callsign||selectedAsset?.id}</b><span>{selectedAsset?.id} · {selectedAsset?.team}</span></div>
     <div><small>NETWORK</small><b>{selectedAsset?.network||'Unknown'}</b><span>{selectedAsset?.detail}</span></div>
     <div><small>LAST CONTACT</small><b>{selectedAsset?.lastSeen||'—'}</b><span>{typeof selectedAsset?.battery==='number'?selectedAsset.battery+'% battery':'Battery not reported'}</span></div>
     <div><small>POSITION</small><b>{selectedAsset?.lat!=null&&selectedAsset?.lon!=null?selectedAsset.lat.toFixed(5)+', '+selectedAsset.lon.toFixed(5):'Not live'}</b><span>{isLive?'Telemetry retained in Command':'Awaiting deployed GPS source'}</span></div>
    </div>
   </article>

   <aside className="deployPanel deploymentState">
    <header><div><small>DEPLOYMENT CONTROL</small><h3>Readiness</h3></div><Boxes size={18}/></header>
    <div className="readinessList">
     {readiness.map(({name,state,owner,icon:Icon,note})=><div key={name}><Icon size={17}/><span><b>{name}</b><small>{note}</small></span><em className={'readinessState '+state.toLowerCase()}>{owner}</em></div>)}
    </div>
    <div className="activationRule"><ShieldCheck size={18}/><div><b>Authority first</b><small>Missing-person deployments support the recognised police, SAR or authorised incident command structure. ORVIA does not self-task into active searches.</small></div></div>
   </aside>
  </section>

  <section className="deployThreeCol">
   <article className="deployPanel">
    <header><div><small>SEARCH MANAGEMENT</small><h3>Sectors</h3></div><Map size={18}/></header>
    <div className="sectorList">{sectors.map(s=><div key={s.id}><span className={'sectorTag '+s.state.toLowerCase()}>{s.id}</span><span><b>{s.label}</b><small>{s.note}</small></span><em>{s.state}</em></div>)}</div>
   </article>
   <article className="deployPanel">
    <header><div><small>COMMUNICATIONS STACK</small><h3>Resilience</h3></div><Wifi size={18}/></header>
    <div className="commsStack">
     <div><Satellite/><span><b>Satellite</b><small>Starlink / managed partner</small></span><em>PARTNER</em></div>
     <div><Router/><span><b>Gateway</b><small>ORVIA router + cellular failover</small></span><em>PLANNED</em></div>
     <div><Radio/><span><b>Voice & GPS</b><small>Professional GPS radio fleet</small></span><em>PARTNER</em></div>
     <div><Signal/><span><b>Off-grid mesh</b><small>Meshtastic / LoRa telemetry</small></span><em>PLANNED</em></div>
    </div>
   </article>
   <article className="deployPanel">
    <header><div><small>FIELD STATUS</small><h3>Asset state</h3></div><BatteryCharging size={18}/></header>
    <div className="miniAssetList">{assets.slice(0,6).map(a=><button key={a.id} onClick={()=>setSelected(a.id)}><AssetIcon kind={a.kind}/><span><b>{a.callsign||a.id}</b><small>{a.network} · {a.team}</small></span><em className={statusClass(a.status)}>{a.status}</em></button>)}</div>
   </article>
  </section>

  <section className="deployPanel supplierPanel">
   <header><div><small>COMMERCIAL DEPLOYMENT MODEL</small><h3>Hire first. Prove it. Then own the fleet.</h3></div><Clock3 size={18}/></header>
   <div className="supplierSteps">{supplierModel.map(([tag,title,copy])=><div key={tag}><span>{tag}</span><b>{title}</b><p>{copy}</p></div>)}</div>
   <div className="supplierNote"><CheckCircle2 size={18}/><p><b>Supplier status:</b> Starlink and radio hardware can be marked <strong>Partner-supplied</strong> per deployment. When ORVIA purchases the same capability, the asset changes to <strong>ORVIA-owned</strong> without changing the operational workflow.</p></div>
  </section>

  {!isLive&&<section className="deployOffline"><WifiOff size={18}/><div><b>No deployed telemetry is currently verified.</b><span>The interface is operational, but the field picture above is explicitly marked as simulation until a real gateway posts authenticated data to <code>/api/deploy/ingest</code>.</span></div></section>}
 </div>;
}
