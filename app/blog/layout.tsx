import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog & Devotionals | RAWN Ministry',
  description:
    'Prophetic writings, daily/weekly devotionals, and teaching articles from RAWN Ministry. Building warriors for Jesus through ongoing discipleship and organic growth.',
  keywords: [
    'RAWN Ministry',
    'blog',
    'devotionals',
    'prophetic writings',
    'teaching articles',
    'discipleship',
    'Christian blog',
  ],
  openGraph: {
    title: 'Blog & Devotionals | RAWN Ministry',
    description:
      'Prophetic writings, devotionals, and teaching articles to build warriors for Jesus.',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Blog & Devotionals | RAWN Ministry',
    description:
      'Prophetic writings, devotionals, and teaching articles to build warriors for Jesus.',
  },
  alternates: {
    canonical: '/blog',
  },
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
