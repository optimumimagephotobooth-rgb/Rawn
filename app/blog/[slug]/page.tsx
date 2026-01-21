import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import BlogPostClient from './BlogPostClient'
import { Database } from '@/types/database'

interface BlogPost {
  id: string
  post_id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  author: string | null
  category: string | null
  tags: string[] | null
  featured_image: string | null
  published_at: string | null
  seo_title: string | null
  seo_description: string | null
  created_at?: string | null
  updated_at?: string | null
  relatedPosts?: Array<{
    id: string
    post_id: string
    title: string
    slug: string
    excerpt: string | null
    featured_image: string | null
    published_at: string | null
  }>
}

async function getPost(slug: string): Promise<BlogPost | null> {
  const supabase = await createClient()

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('status', 'Published')
    .single()

  if (error || !post) {
    return null
  }

  const blogPost = post as Database['public']['Tables']['blog_posts']['Row']

  // Get related posts (same category, excluding current)
  let relatedPosts: any[] = []
  if (blogPost.category) {
    const { data: related } = await supabase
      .from('blog_posts')
      .select('id, post_id, title, slug, excerpt, featured_image, published_at')
      .eq('category', blogPost.category)
      .eq('status', 'Published')
      .neq('id', blogPost.id)
      .order('published_at', { ascending: false })
      .limit(3)

    relatedPosts = related || []
  }

  return {
    ...blogPost,
    relatedPosts,
  } as BlogPost
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
    }
  }

  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org'
  const postUrl = `${siteUrl}/blog/${slug}`
  const title = post.seo_title || post.title
  const description = post.seo_description || post.excerpt || 'Read this article from RAWN Ministry'
  const image = post.featured_image || `${siteUrl}/og-image.jpg`

  return {
    title: `${title} | RAWN Ministry Blog`,
    description,
    keywords: post.tags || [],
    authors: post.author ? [{ name: post.author }] : undefined,
    openGraph: {
      title,
      description,
      url: postUrl,
      siteName: 'RAWN Ministry',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
      locale: 'en_US',
      type: 'article',
      publishedTime: post.published_at || undefined,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags || undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = await getPost(slug)

  if (!post) {
    notFound()
  }

  // Generate structured data (JSON-LD)
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://rawnministry.org'
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt || post.seo_description || '',
    image: post.featured_image ? [post.featured_image] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at || post.published_at || post.created_at,
    author: {
      '@type': 'Person',
      name: post.author || 'RAWN Ministry',
    },
    publisher: {
      '@type': 'Organization',
      name: 'RAWN Ministry',
      logo: {
        '@type': 'ImageObject',
        url: `${siteUrl}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${siteUrl}/blog/${slug}`,
    },
    articleSection: post.category || undefined,
    keywords: post.tags?.join(', ') || undefined,
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      <BlogPostClient post={post} />
    </>
  )
}
