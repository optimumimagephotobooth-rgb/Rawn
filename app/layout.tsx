import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Link from 'next/link'
import './globals.css'
import { Header } from '@/components/Header'
import { GoogleAnalytics } from '@/components/GoogleAnalytics'
import { I18nProvider } from '@/lib/i18n/context'
import { Footer } from '@/components/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org'),
  title: {
    default: 'RAWN Ministry — Raising A Warrior Nation',
    template: '%s | RAWN Ministry',
  },
  description:
    'RAWN Ministry — A prophetic, prayer-driven movement for discipleship, healing, and Kingdom impact. Equipping intercessors, prophets, and disciples across the nations.',
  keywords: [
    'RAWN Ministry',
    'prayer',
    'prophetic',
    'discipleship',
    'intercession',
    'ministry',
    'Christian ministry',
    'prayer ministry',
    'prophetic ministry',
    'healing',
    'Kingdom impact',
  ],
  authors: [{ name: 'RAWN Ministry' }],
  creator: 'RAWN Ministry',
  publisher: 'RAWN Ministry',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org',
    siteName: 'RAWN Ministry',
    title: 'RAWN Ministry — Raising A Warrior Nation',
    description: 'A prophetic, prayer-driven movement for discipleship, healing, and Kingdom impact.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'RAWN Ministry',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'RAWN Ministry — Raising A Warrior Nation',
    description: 'A prophetic, prayer-driven movement for discipleship, healing, and Kingdom impact.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION,
  },
  alternates: {
    canonical: process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <GoogleAnalytics />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'RAWN Ministry',
              alternateName: 'Raising A Warrior Nation',
              url: process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org',
              logo: `${process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org'}/logo.png`,
              description: 'A prophetic, prayer-driven movement for discipleship, healing, and Kingdom impact.',
              sameAs: [
                // Add social media URLs here
              ],
            }),
          }}
        />
      </head>
      <body className={`${inter.className} bg-slate-950 text-slate-50`}>
        <I18nProvider>
          <div className="min-h-screen flex flex-col">
            <Header />

            <main className="flex-1">{children}</main>

            <Footer />
          </div>
        </I18nProvider>
      </body>
    </html>
  )
}
