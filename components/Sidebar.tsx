import Image from 'next/image';
import Link from 'next/link';
import { Activity, BarChart3, BookOpen, BriefcaseBusiness, FolderKanban, Globe2, Home, Layers3, Settings, Share2, Sparkles, Users, Video } from 'lucide-react';

const nav=[
  {href:'/',label:'Overview',icon:Home},
  {href:'/',label:'IRIS',icon:Sparkles},
  {href:'/projects',label:'ORVIA Landscape',icon:Globe2},
  {href:'/social',label:'Socials',icon:Share2},
  {href:'/production',label:'Media',icon:Video},
  {href:'/clients',label:'Clients',icon:Users},
  {href:'/work',label:'Work',icon:FolderKanban},
  {href:'/library',label:'Evidence & Library',icon:BookOpen},
  {href:'/systems',label:'Integrations',icon:Activity},
  {href:'/portal/reports',label:'Reports',icon:BarChart3},
  {href:'/portal',label:'Workspace',icon:BriefcaseBusiness},
  {href:'/systems',label:'Settings',icon:Settings},
];

export function Sidebar(){
  return <aside className="ovSidebar">
    <Link href="/" className="ovSidebarLogo"><Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={700} height={196} priority /></Link>
    <nav className="ovSidebarNav">
      {nav.map(({href,label,icon:Icon},i)=><Link href={href} key={label} className={i===0?'active':''}><Icon size={17}/><span>{label}</span>{i===0?<i/>:null}</Link>)}
    </nav>
    <Link href="/" className="ovCreateButton"><Sparkles size={17}/>Create content</Link>
    <div className="ovSidebarFoot"><small>IRIS conducts</small><b>ORVIA Command</b><p>One system. One source. Every surface.</p></div>
  </aside>;
}
