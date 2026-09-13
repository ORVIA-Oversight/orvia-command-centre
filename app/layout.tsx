import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'ORVIA Command Centre', description: 'Internal ORVIA founder command, evidence and intelligence workspace', robots: { index:false, follow:false, noarchive:true, nosnippet:true } };
export default function RootLayout({ children }:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
