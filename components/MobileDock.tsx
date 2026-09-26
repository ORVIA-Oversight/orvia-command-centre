'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, BriefcaseBusiness, FolderKanban, MessageCircle, ShieldCheck } from 'lucide-react';

const items = [
  { href: '/', label: 'IRIS', icon: MessageCircle },
  { href: '/workspace', label: 'Today', icon: BriefcaseBusiness },
  { href: '/work', label: 'Work', icon: FolderKanban },
  { href: '/projects', label: 'Estate', icon: ShieldCheck },
  { href: '/library', label: 'Evidence', icon: BookOpen },
];

export function MobileDock() {
  const pathname = usePathname();
  return (
    <nav className="mobileDock" aria-label="ORVIA mobile navigation">
      {items.map(({ href, label, icon: Icon }) => {
        const active = href === '/' ? pathname === '/' : pathname.startsWith(href);
        return (
          <Link href={href} key={href} className={active ? 'active' : ''}>
            <Icon size={19} strokeWidth={2.2} />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
