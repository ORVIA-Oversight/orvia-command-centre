'use client';

import { useMemo, useState } from 'react';
import { Bot, CheckCircle2, ChevronRight, CircleAlert, FileCheck2, GitBranch, LockKeyhole, Play, Send, ShieldCheck, Sparkles, Wrench, Mic2, FileText, Video, Globe2, Share2, WandSparkles } from 'lucide-react';
import { coreWorkflow, productionAgents, toolNetwork } from '@/lib/production-os';

const defaultIdea = 'I want a podcast and campaign about ORVIA helping managers get their lives back.';
const formats = [
  ['Podcast', Mic2], ['Blog', FileText], ['Video', Video], ['Website', Globe2], ['Social Pack', Share2], ['Full Content Pack', WandSparkles],
] as const;

function inferWorkOrder(idea: string, selected: string[]) {
  const lower = idea.toLowerCase();
  const requested = new Set(selected);
  if (lower.includes('podcast')) requested.add('Podcast');
  if (lower.includes('video')) requested.add('Video');
  if (lower.includes('blog') || lower.includes('article')) requested.add('Blog');
  if (lower.includes('website') || lower.includes('web')) requested.add('Website');
  if (lower.includes('campaign') || lower.includes('facebook') || lower.includes('linkedin') || lower.includes('social')) requested.add('Social Pack');
  if (requested.has('Full Content Pack')) ['Podcast','Blog','Video','Website','Social Pack'].forEach(x=>requested.add(x));

  const outputs = Array.from(requested.size ? requested : new Set(['Full Content Pack']));
  const agents = ['IRIS','VERA','Brand Guardian','Creative Director','ORVIA Editor','Red Team','Release Controller'];
  if (outputs.includes('Podcast')) agents.push('Podcast Producer','Scriptwriter');
  if (outputs.includes('Social Pack')) agents.push('Social Producer','Design Agent');
  if (outputs.includes('Video')) agents.push('Video Producer','Prompt Engineer','HeyGen Specialist','Synthesia Specialist','Gemini Visual Producer');
  if (outputs.includes('Blog')) agents.push('Blog & Editorial');
  if (outputs.includes('Website')) agents.push('Web Producer');

  return {
    request: idea,
    objective: 'Turn the rough idea into a governed, evidence-backed ORVIA production package.',
    audience: lower.includes('manager') ? 'Managers and operational leaders' : 'To be confirmed by IRIS',
    product: lower.includes('voice') ? 'ORVIA Voice' : 'ORVIA / relevant service to be verified',
    outputs,
    agents: Array.from(new Set(agents)),
    evidence: ['Current ORVIA facts','Current feature/status evidence','Current brand pack'],
    risks: ['Unsupported claims','Brand drift','Unverified tool capability','Publishing without human approval'],
  };
}

function buildMasterDraft(idea: string, outputs: string[]) {
  return `MASTER IDEA\n${idea}\n\nSTORY\nBEGINNING — Define the human problem and why it matters.\nMIDDLE — Show the change ORVIA enables using only verified capability.\nEND — Make the next step clear and useful.\n\nPRODUCTION ROUTES\n${outputs.map(x=>`• ${x}`).join('\n')}\n\nEDITOR RULES\nHuman first. No generic AI language. No unsupported claims. Preserve locked approved sections. Every derivative must trace back to this master message.`;
}

export function ProductionOS() {
  const [idea, setIdea] = useState(defaultIdea);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(['Full Content Pack']);
  const [workOrder, setWorkOrder] = useState(() => inferWorkOrder(defaultIdea, ['Full Content Pack']));
  const [activeAgent, setActiveAgent] = useState('iris');
  const [approval, setApproval] = useState<'AWAITING HUMAN'|'APPROVED'|'CHANGES REQUIRED'>('AWAITING HUMAN');
  const [masterDraft, setMasterDraft] = useState(() => buildMasterDraft(defaultIdea, inferWorkOrder(defaultIdea, ['Full Content Pack']).outputs));

  const agent = useMemo(() => productionAgents.find(a => a.id === activeAgent) ?? productionAgents[0], [activeAgent]);
  const toggleFormat = (name:string) => setSelectedFormats(current => current.includes(name) ? current.filter(x=>x!==name) : [...current,name]);
  const build = () => {
    const next = inferWorkOrder(idea, selectedFormats);
    setWorkOrder(next);
    setMasterDraft(buildMasterDraft(idea, next.outputs));
    setApproval('AWAITING HUMAN');
  };

  return <div className="pageWrap productionWrap">
    <section className="productionHero">
      <div>
        <div className="eyebrow">ORVIA PRODUCTION OPERATING SYSTEM</div>
        <h2>One idea. Specialist agents. Controlled production.</h2>
        <p>IRIS conducts the internal AI workforce. VERA protects truth. The Editor brings the work together. Red Team challenges it. Nothing releases without human approval.</p>
      </div>
      <div className="humanAuthority"><LockKeyhole size={18}/><div><b>Human authority retained</b><span>No autonomous publishing, deployment or canonical brand change.</span></div></div>
    </section>

    <section className="productionComposer">
      <div className="productionComposerHead"><Sparkles size={18}/><div><b>CREATE WITH ORVIA</b><span>Give IRIS the rough thought. The system builds the production job.</span></div></div>
      <textarea value={idea} onChange={e=>setIdea(e.target.value)} placeholder="What do you want to create?" />
      <div className="formatPicker">
        {formats.map(([name,Icon]) => <button type="button" key={name} className={selectedFormats.includes(name)?'selected':''} onClick={()=>toggleFormat(name)}><Icon size={14}/>{name}</button>)}
      </div>
      <button className="buildWorkOrder" onClick={build}><Play size={16}/> Build with IRIS</button>
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

    <section className="productionPanel masterEditor">
      <div className="productionPanelHead"><div><small>ORVIA EDITOR</small><h3>Master Content Object</h3></div><span>One source → many derivatives</span></div>
      <div className="editorGrid">
        <div className="editorContext">
          <small>PROJECT CONTEXT</small>
          <b>{workOrder.product}</b>
          <p>{workOrder.objective}</p>
          <div className="derivativeList">{workOrder.outputs.map(x=><span key={x}>{x}</span>)}</div>
        </div>
        <div className="editorCanvas">
          <textarea value={masterDraft} onChange={e=>setMasterDraft(e.target.value)} />
          <div className="editorActions"><button>Make more human</button><button>Improve hook</button><button>Check claims</button><button>Turn into script</button><button>Build tool pack</button></div>
        </div>
        <div className="editorRail">
          <small>HAND-OFFS</small>
          <div><b>VERA</b><span>Truth & claims</span></div>
          <div><b>Brand Guardian</b><span>Identity & tone</span></div>
          <div><b>Video Producer</b><span>Scenes & production</span></div>
          <div><b>HeyGen / Synthesia</b><span>Tool-specific packs</span></div>
          <div><b>Social Producer</b><span>Platform derivatives</span></div>
          <div><b>Red Team</b><span>Challenge before release</span></div>
        </div>
      </div>
    </section>

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
