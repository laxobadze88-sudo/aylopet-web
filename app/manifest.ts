import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Aylopet',
    short_name: 'Aylopet',
    description: 'Aylopet - Smart Nutrition & Feeding',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#2D4F1E',
    icons: [
      {
        src: '/icon.svg',
        sizes: 'any',
        type: 'image/svg+xml',
      },
    ],
  };
}

