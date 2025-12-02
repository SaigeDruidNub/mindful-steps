import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mindful Steps - Step Counting with Mindfulness',
  description: 'A step counting app that promotes mindful breaks and photography',
  manifest: '/manifest.json',
  icons: {
    icon: '/icon-192x192.png',
    apple: '/icon-192x192.png',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
  },
  themeColor: '#0ea5e9',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-[#201724] via-[#2A1D2E] to-[#332233]">
          {children}
        </div>
      </body>
    </html>
  )
}