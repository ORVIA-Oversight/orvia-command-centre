const stages = [
  ['O','OBSERVATION','See what is happening.','mO'],
  ['R','REFLECTION','Put it in context.','mR'],
  ['V','VISIBILITY','Make it visible.','mV'],
  ['I','INSIGHT','Test what it means.','mI'],
  ['A','ACCOUNTABILITY','Own what happens next.','mA'],
];
export function MethodRail(){ return <div className="methodRail">{stages.map(([l,n,d,c])=><div className={`methodStage ${c}`} key={l}><b>{l}</b><span>{n}</span><small>{d}</small></div>)}</div> }
