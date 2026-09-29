import Link from 'next/link';
import { Bell, Search } from 'lucide-react';

export function Topbar({ title, eyebrow = 'ORVIA OVERSIGHT · UNIFIED OPERATING SYSTEM' }: { title: string; eyebrow?: string }) {
  return (
    <header className="ovTopbar">
      <div className="ovTopIdentity"><small>{eyebrow}</small><h1>{title}</h1></div>
      <div className="ovTopTools">
        <div className="ovSearch"><Search size={15}/><span>Search anything…</span></div>
        <Link href="/work" className="ovBell" title="Work requiring attention"><Bell size={16}/><i/></Link>
        <div className="ovUser"><span>JM</span><div><b>John McGill</b><small>ORVIA</small></div></div>
      </div>
    </header>
  );
}
