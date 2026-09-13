import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/orvia-command-v2',
    name: 'ORVIA Oversight — Command',
    short_name: 'ORVIA Command',
    description: 'Private ORVIA Oversight founder command, intelligence and evidence workspace.',
    start_url: '/?app=orvia-command-v2',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF7F2',
    theme_color: '#0B2450',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/orvia-oversight-logo.png?v=2',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}
