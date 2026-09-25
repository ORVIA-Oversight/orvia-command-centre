import Link from 'next/link';
import { ArrowRight, Building2, Users } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getServerSupabase } from '@/lib/supabase-server';

export const dynamic='force-dynamic';
export const revalidate=0;

async function loadClients(){
 const supabase=getServerSupabase();
 if(!supabase)return {source:'review-build',clients:[],projects:[]};
 const [clients,projects]=await Promise.all([
  supabase.from('web_customers').select('id,name,business,email,updated_at').order('updated_at',{ascending:false}).limit(100),
  supabase.from('web_projects').select('id,customer_id,project_code,state,domain,preview_url,live_url,next_action,updated_at').order('updated_at',{ascending:false}).limit(250)
 ]);
 return {source:'live',clients:clients.data??[],projects:projects.data??[]};
}
export default async function ClientsPage(){
 const data=await loadClients();
 return <Shell><Topbar title="Client Workspaces"/><div className="pageWrap">
  <section className="pageIntro"><div className="eyebrow">TENANT-SCOPED WORK</div><h2>Every client gets the same ORVIA experience — only their work.</h2><p>This Founder view shows the controlled client/project records. External client access will use the same workspace shell with tenant and role restrictions before it is enabled.</p></section>
  <section className="workspaceClientCards">{data.clients.map((client:any)=>{
    const ps=data.projects.filter((p:any)=>p.customer_id===client.id);
    return <Link href={'/clients/'+client.id} className="workspaceClientCard" key={client.id}><div className="clientCardIcon"><Building2 size={20}/></div><div><small>CLIENT WORKSPACE</small><h3>{client.business||client.name}</h3><p>{ps.length} project{ps.length===1?'':'s'} · {client.email}</p></div><ArrowRight size={17}/></Link>
  })}</section>
  {!data.clients.length&&<div className="workspaceEmpty large"><Users size={26}/><b>No live client records returned</b><span>The workspace structure is ready; we will not invent client records.</span></div>}
 </div></Shell>
}