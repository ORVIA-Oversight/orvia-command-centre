import Image from 'next/image';
import Link from 'next/link';
import {
  Activity, BarChart3, BookOpen, Bot, BriefcaseBusiness, FolderKanban,
  Globe2, Mail, Settings, Share2, Sparkles, Users, Video, Inbox, Workflow,
  Building2, Megaphone, ShieldCheck, Headphones, UserRoundCog
} from 'lucide-react';

const primary = [
  { href:'/', label:'IRIS', icon:Sparkles },
  { href:'/work', label:'Inbox & Tasks', icon:Inbox },
  { href:'/workforce', label:'AI Team', icon:Bot },
  { href:'/library', label:'Knowledge', icon:BookOpen },
  { href:'/systems', label:'Automations', icon:Workflow },
];

const departments = [
  { href:'/workforce#admin-people', label:'Admin & People', icon:UserRoundCog },
  { href:'/workforce#growth', label:'Sales & Growth', icon:Megaphone },
  { href:'/workforce#intelligence', label:'Intelligence', icon:ShieldCheck },
  { href:'/workforce#operations', label:'Operations', icon:Headphones },
  { href:'/workforce#external', label:'AI Workers', icon:Building2 },
];

const business = [
  { href:'/communications', label:'Communications', icon:Mail },
  { href:'/clients', label:'Clients', icon:Users },
  { href:'/pulse', label:'PULSE / Socials', icon:Share2 },
  { href:'/production', label:'Media', icon:Video },
  { href:'/projects', label:'ORVIA Landscape', icon:Globe2 },
  { href:'/portal/reports', label:'Reports', icon:BarChart3 },
  { href:'/portal', label:'Workspace', icon:BriefcaseBusiness },
  { href:'/systems', label:'Integrations', icon:Activity },
  { href:'/systems', label:'Settings', icon:Settings },
];

function NavGroup({items}:{items:typeof primary}){
  return <>{items.map(({href,label,icon:Icon},i)=>
    <Link href={href} key={label} className={href==='/'?'active':''}>
      <Icon size={17}/><span>{label}</span>{href==='/'?<i/>:null}
    </Link>
  )}</>;
}

export function Sidebar(){
  return <aside className="ovSidebar">
    <Link href="/" className="ovSidebarLogo">
      <Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={700} height={196} priority />
    </Link>

    <nav className="ovSidebarNav">
      <small className="ovNavLabel">COMMAND</small>
      <NavGroup items={primary}/>
      <small className="ovNavLabel">DEPARTMENTS</small>
      <NavGroup items={departments}/>
      <small className="ovNavLabel">BUSINESS</small>
      <NavGroup items={business}/>
    </nav>

    <Link href="/" className="ovCreateButton"><Sparkles size={17}/>Talk to IRIS</Link>

    <div className="ovSidebarFoot">
      <small>IRIS conducts</small>
      <b>ORVIA Command</b>
      <p>One conversation. The right specialist. Human control.</p>
    </div>
  </aside>;
}
