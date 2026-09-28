import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { PlatformContext } from '@/lib/platform-context';

export function UnifiedShell({context,title,children}:{context:PlatformContext;title:string;children:ReactNode}){
  return <div className="unifiedApp">
    <aside className="unifiedRail">
      <div className="unifiedLogo"><Image src="/orvia-oversight-logo.png" alt="ORVIA Oversight" width={700} height={196} priority/></div>
      <div className="unifiedIdentity">
        <small>{context.mode==='internal'?'INTERNAL ORVIA':'CUSTOMER WORKSPACE'}</small>
        <b>{context.organisation||context.email||'ORVIA Workspace'}</b>
      </div>
      <nav className="unifiedNav">
        {context.modules.map(m=><Link href={m.href} key={m.id} className={"unifiedNavItem tone-"+m.accent}>
          <span className="navTone"/><span><b>{m.label}</b><small>{m.description}</small></span>
        </Link>)}
      </nav>
      <div className="unifiedRailFoot">
        <span>IRIS conducts</span><span>VERA verifies</span><span>Humans decide</span>
      </div>
    </aside>
    <main className="unifiedMain">
      <header className="unifiedTop">
        <div className="spectrum"/>
        <div className="unifiedTopInner">
          <div><small>ORVIA OVERSIGHT · ONE INTERFACE</small><h1>{title}</h1></div>
          <div className="unifiedMode">{context.mode==='internal'?'INTERNAL CONTROL':'YOUR ORVIA'}</div>
        </div>
      </header>
      <div className="unifiedCanvas">{children}</div>
    </main>
  </div>;
}
