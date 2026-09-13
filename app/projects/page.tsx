import Link from 'next/link';
import { ExternalLink, FolderKanban, Globe2 } from 'lucide-react';
import { Shell } from '@/components/Shell';
import { Topbar } from '@/components/Topbar';
import { projectGroups, projects } from '@/lib/projects';

export default function ProjectsPage(){
 return <Shell><Topbar title="Projects & Ventures"/><div className="pageWrap">
  <section className="pageIntro projectIntro">
   <div className="eyebrow">THE ORVIA ESTATE</div>
   <h2>Every business, platform and idea in one place.</h2>
   <p>Each square is a project door. Open it to see the business purpose, current evidence status, website or repo links, workstreams, next actions and where we can carry on building it.</p>
  </section>
  {projectGroups.map(group=>{
   const groupProjects=projects.filter(p=>p.category===group);
   if(!groupProjects.length)return null;
   return <section className="projectGroup" key={group}>
    <div className="projectGroupHead"><div><span>{group}</span><h3>{groupProjects.length} {groupProjects.length===1?'project':'projects'}</h3></div></div>
    <div className="projectGrid">
     {groupProjects.map(project=><article className={`projectTile visual-${project.visual}`} key={project.slug}>
      <Link href={`/projects/${project.slug}`} className="projectTileMain">
       <div className="projectWindowBar"><i/><i/><i/><span>{project.websiteLabel||project.shortName}</span></div>
       <div className="projectVisual">
        <div className="projectMark">{project.shortName}</div>
        <div><small>{project.category}</small><h4>{project.name}</h4></div>
       </div>
       <p>{project.description}</p>
       <div className="projectTileFoot"><span className="projectStatus">{project.status}</span><span className="openProject"><FolderKanban size={14}/> Open project</span></div>
      </Link>
      {project.website&&<a className="projectQuickLink" href={project.website} target="_blank" rel="noreferrer"><Globe2 size={14}/> Website <ExternalLink size={12}/></a>}
     </article>)}
    </div>
   </section>
  })}
 </div></Shell>
}
