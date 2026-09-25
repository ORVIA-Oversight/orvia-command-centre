import type { Metadata, Viewport } from 'next';
import './globals.css';
import './light-overrides.css';
import './production.css';

export const metadata: Metadata = {
  title: 'ORVIA Command',
  description: 'ORVIA Oversight founder command, evidence and intelligence workspace',
  manifest: '/manifest.webmanifest',
  applicationName: 'ORVIA Oversight',
  appleWebApp: {
    capable: true,
    title: 'ORVIA Command',
    statusBarStyle: 'default'
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg'
  },
  robots: { index:false, follow:false, noarchive:true, nosnippet:true }
};

export const viewport: Viewport = {
  themeColor: '#0B2450',
  colorScheme: 'light'
};

export default function RootLayout({ children }:{children:React.ReactNode}){
  return <html lang="en"><body>{children}</body></html>
}
