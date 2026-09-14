'use client';

import { useMemo, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, CircleAlert, FileCheck2, GitBranch, LockKeyhole, Play, Send, ShieldCheck, Sparkles, Wrench } from 'lucide-react';
import { coreWorkflow, productionAgents, toolNetwork } from '@/lib/production-os';

const defaultIdea = 'I want a podcast and campaign about ORVIA helping managers get their lives back.';

function inferWorkOrder(idea: string) {
  const lower = idea.toLowerCase();
  const outputs = [
    lower.includes('podcast') ? 'Podcast' : null,
    lower.includes('campaign') ? 'Campaign' : null,
    lower.includes('video') ? 'Video' : null,
    lower.includes('blog') || lower.includes('article') ? 'Blog' : null,
    lower.includes('website') || lower.includes('web') ? 'Website' : null,
    lower.includes('facebook') ? 'Facebook' : null,
    lower.includes('linkedin') ? 'LinkedIn' : null,
  ].filter(Boolean) as string[];

  const agents = ['IRIS','VERA','Brand Guardian','Creative Director','ORVIA Editor','Red Team','Release Controller'];
  if (outputs.includes('Podcast')) agents.push('Podcast Producer','Scriptwriter');
  if (outputs.includes('Campaign') || outputs.includes('Facebook') || outputs.includes('LinkedIn')) agents.push('Social Producer','Design Agent');
  if (outputs.includes('Video')) agents.push('Video Producer','Prompt Engineer');
  if (outputs.includes('Blog')) agents.push('Blog & Editorial');
  if (outputs.includes('Website')) agents.push('Web Producer');

  return {
    request: idea,
    objective: 'Turn the rough idea into a governed, evidence-backed ORVIA production package.',
    audience: lower.includes('manager') ? 'Managers and operational leaders' : 'To be confirmed by IRIS',
    product: lower.includes('voice') ? 'ORVIA Voice' : 'ORVIA / relevant service to be verified',
    outputs: outputs.length ? outputs : ['Master content pack'],
    agents: Array.from(new Set(agents)),
    evidence: ['Current ORVIA facts','Current feature/status evidence','Current brand pack'],
    risks: ['Unsupported claims','Brand drift','Unverified tool capability','Publishing without human approval'],
  };
}

export function ProductionOS() {
  const [idea, setIdea] = useState(defaultIdea);
  const [workOrder, setWorkOrder] = useState(() => inferWorkOrder(defaultIdea));
  const [activeAgent, setActiveAgent] = useState('iris');
  const [approval, setApproval] = useState<'AWAITING HUMAN'|'APPROVED'|'CHANGES REQUIRED'>('AWAITING HUMAN');

  const agent = useMemo(() => productionAgents.find(a => a.id === activeAgent) ?? productionAgents[0], [activeAgent]);

  return <div className="pageWrap productionWrap">
    <section className="productionHero">
      <div>
        <div className="eyebrow">ORVIA PRODUCTION OPERATING SYSTEM</div>
        <h2>Idea in. Governed production out.</h2>
        <p>IRIS conducts the specialist workforce. VERA protects truth. Every output is edited, challenged and held for human approval before release.</p>
      </div>
      <div className="humanAuthority"><LockKeyhole size={18}/><div><b>Human authority retained</b><span>No autonomous publishing, deployment or canonical change.</span></div></div>
    </section>

    <section className="productionComposer">
      <div className="productionComposerHead"><Sparkles size={18}/><div><b>CREATE WITH ORVIA</b><span>What do you want to create?</span></div></div>
      <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="Give IRIS a rough idea..." />
      <button onClick={()=>{ setWorkOrder(inferWorkOrder(idea)); setApproval('AWAITING HUMAN'); }}><Play size={16}/> Build work order</button>
    </section>

    <div className="workflowRail" aria-label="Production workflow">
      {coreWorkflow.map((step,index)=><div key={step}><span>{String(index+1).padStart(2,'0')}</span><b>{step}</b></div>)}
    </div>

    <div className="productionGrid">
      <section className="productionPanel workOrderPanel">
        <div className="productionPanelHead"><div><small>IRIS OUTPUT</small><h3>Work Order</h3></div><span className="statePill">DRAFT</span></div>
        <div className="workOrderRows">
          <WorkRow label="Request" value={workOrder.request}/>
          <WorkRow label="Objective" value={workOrder.objective}/>
          <WorkRow label="Audience" value={workOrder.audience}/>
          <WorkRow label="Product" value={workOrder.product}/>
          <WorkRow label="Outputs" value={workOrder.outputs.join(' · ')}/>
          <WorkRow label="Evidence required" value={workOrder.evidence.join(' · ')}/>
          <WorkRow label="Risks" value={workOrder.risks.join(' · ')}/>
        </div>
        <div className="assignedAgents"><small>AGENTS ASSIGNED</small><div>{workOrder.agents.map(name=><span key={name}>{name}</span>)}</div></div>
      </section>

      <section className="productionPanel approvalPanel">
        <div className="productionPanelHead"><div><small>CONTROL GATE</small><h3>Approval</h3></div><FileCheck2 size={18}/></div>
        <div className={`approvalState ${approval==='APPROVED'?'ok':approval==='CHANGES REQUIRED'?'warn':''}`}>
          {approval==='APPROVED'?<CheckCircle2/>:<CircleAlert/>}
          <div><b>{approval}</b><span>Approval applies to this version only.</span></div>
        </div>
        <div className="gateList">
          <Gate name="VERA evidence" state="Required"/>
          <Gate name="Brand check" state="Required"/>
          <Gate name="Editor" state="Required"/>
          <Gate name="Red Team" state="Required"/>
          <Gate name="Human approval" state="Required"/>
        </div>
        <div className="approvalActions">
          <button onClick={()=>setApproval('APPROVED')}><CheckCircle2 size={15}/> Approve version</button>
          <button className="secondary" onClick={()=>setApproval('CHANGES REQUIRED')}><Send size={15}/> Return for changes</button>
        </div>
      </section>
    </div>

    <section className="productionPanel agentStudio">
      <div className="productionPanelHead"><div><small>ORVIA AGENT STUDIO</small><h3>Specialist workforce</h3></div><span>{productionAgents.length} governed agents</span></div>
      <div className="agentStudioGrid">
        <div className="agentList">
          {productionAgents.map(a=><button key={a.id} onClick={()=>setActiveAgent(a.id)} className={activeAgent===a.id?'active':''}>
            <Bot size={15}/><span><b>{a.name}</b><small>{a.role}</small></span><ChevronRight size={14}/>
          </button>)}
        </div>
        <div className="agentDetail">
          <div className="agentDetailTop"><div className="agentIcon"><Bot/></div><div><small>{agent.id.toUpperCase()} · v{agent.version}</small><h3>{agent.name}</h3><p>{agent.role}</p></div><span className="activePill">{agent.status}</span></div>
          <p className="agentPurpose">{agent.purpose}</p>
          <div className="agentMetaGrid">
            <Meta title="INPUTS" items={agent.inputs}/>
            <Meta title="OUTPUTS" items={agent.outputs}/>
            <Meta title="TOOLS" items={agent.tools}/>
            <Meta title="PERMISSIONS" items={agent.permissions}/>
          </div>
          <div className="agentRule"><ShieldCheck size={16}/><span><b>Approval rule</b>{agent.approval}</span></div>
        </div>
      </div>
    </section>

    <section className="productionPanel toolNetwork">
      <div className="productionPanelHead"><div><small>ORVIA TOOL NETWORK</small><h3>Integration truth</h3></div><Wrench size={18}/></div>
      <div className="toolGrid">
        {toolNetwork.map(tool=><article key={tool.name}>
          <div><b>{tool.name}</b><span className={`toolState state-${tool.status.toLowerCase().replaceAll(' ','-').replaceAll('/','-')}`}>{tool.status}</span></div>
          <p>{tool.purpose}</p><small>{tool.note}</small>
          <footer><GitBranch size={13}/>{tool.agents.join(' · ')}</footer>
        </article>)}
      </div>
    </section>
  </div>;
}

function WorkRow({label,value}:{label:string;value:string}) { return <div><small>{label}</small><p>{value}</p></div>; }
function Gate({name,state}:{name:string;state:string}) { return <div><span>{name}</span><b>{state}</b></div>; }
function Meta({title,items}:{title:string;items:string[]}) { return <div className="agentMeta"><small>{title}</small>{items.map(i=><span key={i}>{i}</span>)}</div>; }
