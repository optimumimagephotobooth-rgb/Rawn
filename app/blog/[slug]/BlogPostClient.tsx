'use client'

import Link from 'next/link'
import { Card } from '@/components/ui/Card'
import { ShareButtons } from '@/components/social/ShareButtons'
import { format, parseISO } from 'date-fns'
import ReactMarkdown from 'react-markdown'

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

interface BlogPostClientProps {
  post: BlogPost
}

export default function BlogPostClient({ post }: BlogPostClientProps) {
  const postUrl = `/blog/${post.slug}`

  return (
    <div className="min-h-[calc(100dvh-150px] bg-gradient-to-b from-slate-950 via-slate-950 to-slate-900">
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-amber-200/90 hover:text-amber-100 text-sm mb-6 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Blog
        </Link>

        {post.featured_image && (
          <div className="mb-6 sm:mb-8 rounded-xl overflow-hidden shadow-2xl">
            <img
              src={post.featured_image}
              alt={post.title}
              className="w-full h-48 sm:h-64 md:h-96 object-cover"
            />
          </div>
        )}

        <Card className="bg-slate-900/80 border border-white/10 mb-6 sm:mb-8 p-4 sm:p-6">
          <div className="space-y-4">
            {post.category && (
              <Link
                href={`/blog?category=${encodeURIComponent(post.category)}`}
                className="inline-block text-xs font-semibold text-amber-200/90 uppercase tracking-wide hover:text-amber-100 transition-colors"
              >
                {post.category}
              </Link>
            )}
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-semibold text-slate-50 leading-tight">
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-sm text-slate-400">
              {post.author && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  {post.author}
                </span>
              )}
              {post.published_at && (
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {format(parseISO(post.published_at), 'MMMM d, yyyy')}
                </span>
              )}
            </div>

            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {post.tags.map((tag) => (
                  <Link
                    key={tag}
                    href={`/blog?search=${encodeURIComponent(tag)}`}
                    className="px-3 py-1 rounded-full bg-amber-400/20 text-amber-200/90 text-xs hover:bg-amber-400/30 transition-colors"
                  >
                    #{tag}
                  </Link>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-white/10">
              <ShareButtons
                url={postUrl}
                title={post.title}
                description={post.excerpt || post.seo_description || ''}
              />
            </div>
          </div>
        </Card>

        <Card className="bg-slate-900/80 border border-white/10 mb-8 sm:mb-12 p-4 sm:p-6 md:p-8">
          <div className="prose prose-invert prose-amber max-w-none text-slate-300 leading-relaxed prose-headings:text-slate-50 prose-a:text-amber-300 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-100 prose-code:text-amber-200 prose-code:bg-slate-800 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-slate-950 prose-blockquote:border-amber-400/50 prose-blockquote:text-slate-300 prose-img:rounded-lg">
            <ReactMarkdown
              components={{
                p: ({ children }) => <p className="mb-4 last:mb-0">{children}</p>,
                h1: ({ children }) => <h1 className="text-3xl font-bold mb-4 mt-6 first:mt-0">{children}</h1>,
                h2: ({ children }) => <h2 className="text-2xl font-bold mb-3 mt-6 first:mt-0">{children}</h2>,
                h3: ({ children }) => <h3 className="text-xl font-semibold mb-2 mt-4 first:mt-0">{children}</h3>,
                ul: ({ children }) => <ul className="list-disc list-inside mb-4 space-y-1">{children}</ul>,
                ol: ({ children }) => <ol className="list-decimal list-inside mb-4 space-y-1">{children}</ol>,
                li: ({ children }) => <li className="ml-4">{children}</li>,
                blockquote: ({ children }) => (
                  <blockquote className="border-l-4 border-amber-400/50 pl-4 my-4 italic text-slate-300">
                    {children}
                  </blockquote>
                ),
                code: ({ inline, children, ...props }: { inline?: boolean; children?: React.ReactNode; [key: string]: any }) => {
                  if (inline) {
                    return (
                      <code className="bg-slate-800 text-amber-200 px-1.5 py-0.5 rounded text-sm" {...props}>
                        {children}
                      </code>
                    )
                  }
                  return (
                    <code className="block bg-slate-950 p-4 rounded-lg overflow-x-auto text-sm" {...props}>
                      {children}
                    </code>
                  )
                },
                a: ({ href, children }) => (
                  <a
                    href={href}
                    target={href?.startsWith('http') ? '_blank' : undefined}
                    rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
                    className="text-amber-300 hover:text-amber-200 underline"
                  >
                    {children}
                  </a>
                ),
                img: ({ src, alt }) => (
                  <img
                    src={src || ''}
                    alt={alt || ''}
                    className="rounded-lg my-4 max-w-full h-auto"
                    loading="lazy"
                  />
                ),
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </Card>

        {post.relatedPosts && post.relatedPosts.length > 0 && (
          <div className="mt-8 sm:mt-12">
            <h2 className="text-xl sm:text-2xl font-semibold text-slate-50 mb-6">Related Posts</h2>
            <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {post.relatedPosts.map((related) => (
                <Link key={related.id} href={`/blog/${related.slug}`}>
                  <Card className="bg-slate-900/80 border border-white/10 hover:border-amber-400/60 transition-all h-full flex flex-col group">
                    {related.featured_image && (
                      <div className="mb-4 -mx-6 -mt-6 overflow-hidden rounded-t-xl">
                        <img
                          src={related.featured_image}
                          alt={related.title}
                          className="w-full h-32 sm:h-40 object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="flex-1 flex flex-col p-4 sm:p-6">
                      <h3 className="text-lg font-semibold text-slate-50 mb-2 line-clamp-2 group-hover:text-amber-200 transition-colors">
                        {related.title}
                      </h3>
                      {related.excerpt && (
                        <p className="text-sm text-slate-400 line-clamp-2 flex-1">
                          {related.excerpt}
                        </p>
                      )}
                      {related.published_at && (
                        <p className="text-xs text-slate-500 mt-3">
                          {format(parseISO(related.published_at), 'MMM d, yyyy')}
                        </p>
                      )}
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      </article>
    </div>
  )
}
