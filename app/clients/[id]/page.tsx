import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, FolderKanban } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export default async function ClientWorkspace({params}:{params:Promise<{id:string}>}){
 const {id}=await params; const supabase=getServerSupabase(); if(!supabase)notFound();
 const [clientResult,projectResult]=await Promise.all([
  supabase.from('web_customers').select('id,name,business,email,updated_at').eq('id',id).maybeSingle(),
  supabase.from('web_projects').select('id,project_code,state,domain,preview_url,live_url,version_label,next_action,orvia_action,updated_at').eq('customer_id',id).order('updated_at',{ascending:false})
 ]);
 const client=clientResult.data;if(!client)notFound();const ps=projectResult.data??[];
 return <Shell><Topbar title={client.business||client.name} eyebrow="ORVIA · CLIENT WORKSPACE · FOUNDER VIEW"/><div className="pageWrap">
  <Link href="/clients" className="backLink"><ArrowLeft size={15}/> Client workspaces</Link>
  <section className="pageIntro"><div className="eyebrow">CLIENT WORKSPACE</div><h2>{client.business||client.name}</h2><p>{client.name} · {client.email}. This is the private Founder view of the client workspace. External access remains disabled until tenant RLS and client authentication are verified.</p></section>
  <section className="workspaceClientProjectGrid">{ps.map((project:any)=><article className="workspaceClientProject" key={project.id}><div><small>{project.project_code}</small><h3>{project.domain||'Project in build'}</h3><p>{project.next_action||project.orvia_action||'No next action recorded.'}</p></div><span className="projectStatusLarge">{project.state}</span><div className="clientProjectLinks">{project.preview_url&&<a href={project.preview_url} target="_blank" rel="noreferrer">Preview <ExternalLink size={12}/></a>}{project.live_url&&<a href={project.live_url} target="_blank" rel="noreferrer">Live <ExternalLink size={12}/></a>}</div></article>)}</section>
  {!ps.length&&<div className="workspaceEmpty large"><FolderKanban size={25}/><b>No projects are recorded for this client</b><span>The workspace is intentionally evidence-led and will not infer missing work.</span></div>}
 </div></Shell>
}