import Image from 'next/image';
import Link from 'next/link';
import { Activity, BookOpen, FolderKanban, Gauge, Home, Radar, Search, ShieldCheck } from 'lucide-react';

const nav = [
  { href: '/', label: 'Today', icon: Home },
  { href: '/projects', label: 'Projects & Ventures', icon: FolderKanban },
  { href: '/intelligence', label: 'Intelligence', icon: Radar },
  { href: '/library', label: 'Controlled Library', icon: BookOpen },
  { href: '/systems', label: 'Systems & Telemetry', icon: Activity },
];

export function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logoPlate"><Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={700} height={196} priority /></div>
      <div className="sidebarTitle">FOUNDER COMMAND ENVIRONMENT</div>
      <nav className="sidebarNav">
        {nav.map(({ href, label, icon: Icon }) => <Link href={href} key={href}><Icon size={17}/><span>{label}</span></Link>)}
      </nav>
      <div className="sidebarSectionTitle">WORKING AREAS</div>
      <div className="sidebarMini"><Search size={15}/> Brand & SEO</div>
      <div className="sidebarMini"><Gauge size={15}/> Launch control</div>
      <div className="sidebarMini"><ShieldCheck size={15}/> VERA evidence</div>
      <div className="methodMini">
        <span>ORVIA METHODOLOGY</span>
        <div className="methodLetters">
          <b className="mO">O</b><b className="mR">R</b><b className="mV">V</b><b className="mI">I</b><b className="mA">A</b>
        </div>
        <p>IRIS coordinates. VERA protects the truth. The human decides.</p>
      </div>
    </aside>
  );
}
