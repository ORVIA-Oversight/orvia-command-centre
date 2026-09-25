import Image from 'next/image';
import Link from 'next/link';
import { Activity, BookOpen, BriefcaseBusiness, FolderKanban, Home, ShieldCheck, Users } from 'lucide-react';

const nav=[
  {href:'/workspace',label:'My Workspace',icon:BriefcaseBusiness},
  {href:'/',label:'Talk to IRIS',icon:Home},
  {href:'/work',label:'Work',icon:FolderKanban},
  {href:'/projects',label:'ORVIA Landscape',icon:ShieldCheck},
  {href:'/clients',label:'Client Workspaces',icon:Users},
  {href:'/library',label:'Evidence & Library',icon:BookOpen},
  {href:'/systems',label:'Systems & Health',icon:Activity},
];

export function Sidebar(){
  return <aside className="sidebar">
    <div className="logoPlate"><Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={700} height={196} priority /></div>
    <div className="sidebarTitle">MY ORVIA WORKSPACE</div>
    <nav className="sidebarNav">
      {nav.map(({href,label,icon:Icon})=><Link href={href} key={href}><Icon size={17}/><span>{label}</span></Link>)}
    </nav>

    <div className="sidebarSectionTitle">CONTROL MODEL</div>
    <div className="sidebarMini"><span>A0</span> Read / report</div>
    <div className="sidebarMini"><span>A1</span> Safe / reversible</div>
    <div className="sidebarMini"><span>A2</span> Controlled production</div>
    <div className="sidebarMini"><span>A3</span> Human approval</div>
    <div className="sidebarMini"><span>A4</span> Human only</div>

    <div className="methodMini">
      <span>ORVIA OPERATING LOOP</span>
      <div className="methodLetters"><b className="mO">O</b><b className="mR">R</b><b className="mV">V</b><b className="mI">I</b><b className="mA">A</b></div>
      <p>Command is the front door. IRIS conducts. HIVE remembers. VITA challenges. VERA verifies. Humans decide.</p>
    </div>
  </aside>;
}
