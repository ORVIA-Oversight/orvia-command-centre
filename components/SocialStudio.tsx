'use client';

import { useMemo, useState } from 'react';
import {
  BadgeCheck,
  Bot,
  CheckCircle2,
  CircleAlert,
  Film,
  Image as ImageIcon,
  Layers3,
  LayoutTemplate,
  Loader2,
  Megaphone,
  MessageSquareText,
  MonitorPlay,
  Ratio,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from 'lucide-react';
import styles from './SocialStudio.module.css';

const campaignTypes = ['Campaign','UGC ad','Hero ad','Explainer','Founder video','Price card','Launch pack'] as const;
const platforms = ['LinkedIn','Facebook','Instagram','TikTok','YouTube','Google Business'] as const;
const ratios = ['9:16','1:1','4:5','16:9'] as const;
const tones = ['Human & direct','Warm & reassuring','Commercial','Premium','Educational','Energetic'] as const;

type QueueResult = {
  status?: string;
  answer?: string;
  workId?: string;
  authority?: string;
  approvalRequired?: boolean;
  reason?: string;
};

export function SocialStudio({ metricoolReady }:{ metricoolReady:boolean }) {
  const [brief,setBrief] = useState('Create a short social campaign that explains what ORVIA does, why it matters, and gives the viewer one clear next step.');
  const [campaignType,setCampaignType] = useState<(typeof campaignTypes)[number]>('Campaign');
  const [selectedPlatforms,setSelectedPlatforms] = useState<string[]>(['LinkedIn','Facebook','Instagram']);
  const [ratio,setRatio] = useState<(typeof ratios)[number]>('9:16');
  const [tone,setTone] = useState<(typeof tones)[number]>('Human & direct');
  const [presenter,setPresenter] = useState('No presenter');
  const [brandSource,setBrandSource] = useState('Current ORVIA brand pack');
  const [queueing,setQueueing] = useState(false);
  const [queueResult,setQueueResult] = useState<QueueResult|null>(null);

  const directions = useMemo(() => {
    const subject = brief.trim() || 'the campaign';
    return [
      {
        title:'Human problem → useful answer',
        format:'Story-led',
        copy:`Open with the real-world problem behind ${subject.toLowerCase()}, then show one practical ORVIA response and finish with a single CTA.`,
      },
      {
        title:'Proof, not hype',
        format:'Evidence-led',
        copy:'Lead with a concrete fact, workflow or demonstration. Keep claims traceable to VERA-checked evidence and show the product in use.',
      },
      {
        title:'Founder perspective',
        format:'Talking-head',
        copy:'Use a short founder-led explanation in plain language, supported by captions and product cutaways. Keep the final release human-approved.',
      },
      {
        title:'Platform-native cut',
        format:'Fast social',
        copy:`Build a tight ${ratio} version with a strong first two seconds, on-screen text, clear visual rhythm and channel-specific CTA variants.`,
      },
    ];
  },[brief,ratio]);

  const togglePlatform = (name:string) => {
    setSelectedPlatforms(current => current.includes(name) ? current.filter(x=>x!==name) : [...current,name]);
  };

  const queueBuild = async () => {
    if (!brief.trim()) return;
    setQueueing(true);
    setQueueResult(null);

    const instruction = [
      'SOCIAL STUDIO PRODUCTION REQUEST',
      `Campaign type: ${campaignType}`,
      `Brief: ${brief.trim()}`,
      `Platforms: ${selectedPlatforms.join(', ') || 'To be confirmed'}`,
      `Primary aspect ratio: ${ratio}`,
      `Tone: ${tone}`,
      `Presenter: ${presenter}`,
      `Brand source: ${brandSource}`,
      'Required outputs: four creative directions, master copy, platform-native derivatives, media brief, captions, CTA, claim/evidence check, approval gate, release-ready Metricool package.',
      'Controls: VERA verifies factual claims and current prices/product status. CRUCIBLE challenges sensitive or consequential output. No publishing or spend without human approval.',
      'Media rendering: prepare the production pack now; do not claim video/image generation is complete unless a verified media provider has actually rendered the asset.',
    ].join('\n');

    try {
      const response = await fetch('/api/iris/ask',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({question:instruction}),
      });
      const data = await response.json();
      setQueueResult(data);
    } catch {
      setQueueResult({status:'INCOMPLETE',reason:'The Social Studio could not reach IRIS. Nothing was published or released.'});
    } finally {
      setQueueing(false);
    }
  };

  return <div className={styles.studio}>
    <section className={styles.hero}>
      <div>
        <div className={styles.eyebrow}>IRIS · SOCIAL STUDIO</div>
        <h2>Describe the campaign. Build the production pack.</h2>
        <p>Prompt-led creative planning inspired by the workflow in your example, but wired into ORVIA controls: SOCIAL creates, VERA checks, CRUCIBLE challenges where needed, you approve, and Metricool handles release when connected.</p>
      </div>
      <div className={styles.guard}>
        <ShieldCheck size={19}/>
        <div><b>Human release authority</b><span>AI can prepare creative work. It cannot publish in your name, spend budget or release consequential claims without approval.</span></div>
      </div>
    </section>

    <div className={styles.workspace}>
      <aside className={styles.controls}>
        <div className={styles.panelTitle}><LayoutTemplate size={16}/><div><b>Creative setup</b><span>Define the output before production.</span></div></div>

        <label className={styles.label}>Campaign type</label>
        <div className={styles.chips}>
          {campaignTypes.map(x=><button key={x} type="button" className={campaignType===x?styles.activeChip:''} onClick={()=>setCampaignType(x)}>{x}</button>)}
        </div>

        <label className={styles.label}>Channels</label>
        <div className={styles.chips}>
          {platforms.map(x=><button key={x} type="button" className={selectedPlatforms.includes(x)?styles.activeChip:''} onClick={()=>togglePlatform(x)}>{x}</button>)}
        </div>

        <label className={styles.label}><Ratio size={13}/> Primary format</label>
        <div className={styles.chips}>
          {ratios.map(x=><button key={x} type="button" className={ratio===x?styles.activeChip:''} onClick={()=>setRatio(x)}>{x}</button>)}
        </div>

        <label className={styles.label}>Tone</label>
        <select value={tone} onChange={e=>setTone(e.target.value as (typeof tones)[number])} className={styles.select}>
          {tones.map(x=><option key={x}>{x}</option>)}
        </select>

        <label className={styles.label}><UserRound size={13}/> Presenter</label>
        <select value={presenter} onChange={e=>setPresenter(e.target.value)} className={styles.select}>
          <option>No presenter</option>
          <option>John / founder reference</option>
          <option>Approved avatar</option>
          <option>UGC-style actor</option>
          <option>Voiceover only</option>
        </select>

        <label className={styles.label}>Brand / product source</label>
        <select value={brandSource} onChange={e=>setBrandSource(e.target.value)} className={styles.select}>
          <option>Current ORVIA brand pack</option>
          <option>Current product page + brand pack</option>
          <option>Uploaded campaign assets</option>
          <option>Client-approved brand pack</option>
        </select>
      </aside>

      <main className={styles.canvas}>
        <div className={styles.composerHead}>
          <Sparkles size={18}/>
          <div><b>Tell SOCIAL what you want</b><span>Rough language is fine. IRIS will turn it into a controlled work order.</span></div>
        </div>
        <textarea value={brief} onChange={e=>setBrief(e.target.value)} className={styles.textarea} placeholder="e.g. Make me a 20-second vertical ad for ORVIA Voice aimed at busy tradespeople who miss customer calls..." />

        <div className={styles.quickRow}>
          <button type="button" onClick={()=>setBrief('Create a 20-second vertical ad for ORVIA Voice aimed at busy tradespeople who lose enquiries because they cannot answer while working. Show the problem, the call-handling solution and one clear start-now CTA.')}>Voice ad</button>
          <button type="button" onClick={()=>setBrief('Create a founder-led ORVIA explainer that makes the company easy to understand in under 30 seconds. Human, calm, premium and evidence-led.')}>Founder explainer</button>
          <button type="button" onClick={()=>setBrief('Create a product launch pack with a hero video, three short cut-downs, a price card, platform captions and a clear conversion CTA.')}>Launch pack</button>
        </div>

        <div className={styles.sectionHead}><Megaphone size={16}/><div><b>Four starting directions</b><span>Creative routes prepared before any media is rendered.</span></div></div>
        <div className={styles.ideaGrid}>
          {directions.map((idea,index)=><article key={idea.title}>
            <div className={styles.ideaTop}><span>{String(index+1).padStart(2,'0')}</span><em>{idea.format}</em></div>
            <h3>{idea.title}</h3>
            <p>{idea.copy}</p>
          </article>)}
        </div>

        <div className={styles.outputStrip}>
          <Output icon={<Film size={16}/>} title="Video pack" text="Hero + short derivatives"/>
          <Output icon={<ImageIcon size={16}/>} title="Graphics" text="Poster, card, carousel"/>
          <Output icon={<MessageSquareText size={16}/>} title="Copy" text="Hooks, captions, CTA"/>
          <Output icon={<Layers3 size={16}/>} title="Variants" text="Per channel + ratio"/>
        </div>

        <button type="button" className={styles.queueButton} onClick={queueBuild} disabled={queueing || !brief.trim()}>
          {queueing?<Loader2 size={17} className={styles.spin}/>:<Send size={17}/>}
          {queueing?'Routing to IRIS…':'Queue production in IRIS'}
        </button>

        {queueResult && <div className={queueResult.status==='COMPLETE'?styles.success:styles.warning}>
          {queueResult.status==='COMPLETE'?<CheckCircle2 size={18}/>:<CircleAlert size={18}/>}
          <div>
            <b>{queueResult.status==='COMPLETE'?'Production request recorded':'Request not completed'}</b>
            <span>{queueResult.answer || queueResult.reason || 'IRIS returned no additional detail.'}</span>
            {queueResult.workId && <code>Work ID: {queueResult.workId}</code>}
          </div>
        </div>}
      </main>

      <aside className={styles.statusRail}>
        <div className={styles.panelTitle}><Bot size={16}/><div><b>Production chain</b><span>What happens after the brief.</span></div></div>
        <Step n="1" title="SOCIAL" text="Builds concepts, scripts, copy and media brief."/>
        <Step n="2" title="VERA" text="Checks claims, prices and current product truth."/>
        <Step n="3" title="MEDIA" text="Canva / video provider renders approved assets when connected."/>
        <Step n="4" title="CRUCIBLE" text="Challenges sensitive or consequential output."/>
        <Step n="5" title="HUMAN" text="You approve the exact version and release window."/>
        <Step n="6" title="METRICOOL" text="Schedules, publishes and returns performance data."/>

        <div className={styles.connectionBox}>
          <div><span>Metricool runtime</span><b className={metricoolReady?styles.ok:styles.notReady}>{metricoolReady?'READY':'NOT CONNECTED'}</b></div>
          <div><span>Canva</span><b className={styles.connected}>CONNECTED</b></div>
          <div><span>Video/avatar provider</span><b className={styles.notReady}>NOT VERIFIED</b></div>
          <p>No fake “render complete” state: the Studio only marks media as generated after a verified provider returns an asset.</p>
        </div>

        <div className={styles.truthBox}>
          <BadgeCheck size={17}/>
          <div><b>Evidence before release</b><span>Every material factual claim should be traceable to current ORVIA evidence before it becomes public content.</span></div>
        </div>
      </aside>
    </div>
  </div>;
}

function Output({icon,title,text}:{icon:React.ReactNode;title:string;text:string}) {
  return <div>{icon}<span><b>{title}</b><small>{text}</small></span></div>;
}

function Step({n,title,text}:{n:string;title:string;text:string}) {
  return <div className={styles.step}><span>{n}</span><div><b>{title}</b><small>{text}</small></div></div>;
}
