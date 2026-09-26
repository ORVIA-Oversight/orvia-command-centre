import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { MobileDock } from './MobileDock';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <>
      <Sidebar/>
      <main className="mainShell">{children}</main>
      <MobileDock/>
    </>
  );
}
