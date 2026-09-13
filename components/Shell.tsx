import type { ReactNode } from 'react';
import { Sidebar } from './Sidebar';
export function Shell({ children }: { children: ReactNode }) { return <><Sidebar/><main className="mainShell">{children}</main></>; }
