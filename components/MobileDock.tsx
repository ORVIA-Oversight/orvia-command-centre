'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, FolderKanban, MessageCircle, Users, History } from 'lucide-react';

const items = [
  { href: '/', label: 'Home', icon: MessageCircle },
  { href: '/history', label: 'History', icon: History },
  { href: '/workforce', label: 'Teams', icon: Users },
  { href: '/work', label: 'Tasks', icon: FolderKanban },
  { href: '/library', label: 'HIVE', icon: BookOpen },
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
