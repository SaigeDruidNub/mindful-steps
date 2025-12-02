export default function manifest() {
  return {
    name: 'Mindful Steps',
    short_name: 'MindfulSteps',
    description: 'A step counting app that promotes mindful breaks and photography',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#0ea5e9',
    orientation: 'portrait',
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'maskable any'
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable any'
      }
    ],
    categories: ['health', 'fitness', 'lifestyle', 'mindfulness'],
    lang: 'en',
    dir: 'ltr'
  };
}