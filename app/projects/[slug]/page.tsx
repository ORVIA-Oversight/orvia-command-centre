import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ExternalLink, Github, Globe2, ListChecks, Route, ShieldCheck } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { getProject, projects } from '@/lib/projects';

export function generateStaticParams(){return projects.map(project=>({slug:project.slug}));}

export default async function ProjectPage({params}:{params:Promise<{slug:string}>}){
 const {slug}=await params;
 const project=getProject(slug);
 if(!project)notFound();
 return <Shell><Topbar title={project.name}/><div className="pageWrap projectRoom">
  <Link href="/projects" className="backLink"><ArrowLeft size={15}/> All projects</Link>
  <section className={`projectHero visual-${project.visual}`}>
   <div className="projectHeroCopy"><div className="eyebrow">{project.category.toUpperCase()}</div><div className="projectHeroMark">{project.shortName}</div><h2>{project.name}</h2><p>{project.description}</p><div className="projectHeroActions">
    {project.website&&<a href={project.website} target="_blank" rel="noreferrer"><Globe2 size={16}/> Open website <ExternalLink size={13}/></a>}
    {project.github&&<a href={project.github} target="_blank" rel="noreferrer" className="secondaryAction"><Github size={16}/> GitHub <ExternalLink size={13}/></a>}
    {project.parentWebsite&&<a href={project.parentWebsite} target="_blank" rel="noreferrer" className="secondaryAction">ORVIA master site <ExternalLink size={13}/></a>}
   </div></div>
   <div className="projectHeroPreview"><div className="projectWindowBar large"><i/><i/><i/><span>{project.websiteLabel||'PROJECT WORKROOM'}</span></div><div className="previewBody"><small>COMMAND STATUS</small><strong>{project.status}</strong><p>{project.commercialSurface}</p></div></div>
  </section>
  <section className="projectRoomGrid">
   <article className="panel"><div className="panelHead"><div><span>WORKSTREAMS</span><h3>What sits behind this project</h3></div><Route size={18}/></div><div className="panelBody projectList">{project.workstreams.map((item,index)=><div key={item}><b>{String(index+1).padStart(2,'0')}</b><span>{item}</span></div>)}</div></article>
   <article className="panel"><div className="panelHead"><div><span>NEXT ACTIONS</span><h3>What we can work on now</h3></div><ListChecks size={18}/></div><div className="panelBody actionStack">{project.nextActions.map(item=><div key={item}><span>→</span><p>{item}</p></div>)}</div></article>
  </section>
  <section className="twoCol spaced">
   <article className="panel"><div className="panelHead"><div><span>COMMERCIAL POSITION</span><h3>How this should reach the customer</h3></div><Globe2 size={18}/></div><div className="panelBody"><p className="projectLongCopy">{project.commercialSurface}</p></div></article>
   <article className="panel"><div className="panelHead"><div><span>EVIDENCE / CONTROL</span><h3>Current evidence note</h3></div><ShieldCheck size={18}/></div><div className="panelBody"><p className="projectLongCopy">{project.evidenceNote}</p><div className="projectStatusLarge">{project.status}</div></div></article>
  </section>
 </div></Shell>
}
