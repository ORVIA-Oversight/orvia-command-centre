import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: '/',
    name: 'ORVIA Command Centre',
    short_name: 'ORVIA Command',
    description: 'Private ORVIA founder command, intelligence and evidence workspace.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#FAF7F2',
    theme_color: '#0B2450',
    categories: ['business', 'productivity'],
    icons: [
      {
        src: '/orvia-oversight-logo.png',
        type: 'image/png',
        purpose: 'any'
      }
    ]
  };
}
