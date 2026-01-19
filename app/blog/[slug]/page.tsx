import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getBlogPost, getAllBlogPosts } from '@/lib/blog-posts'
import { ArrowLeft, Clock, Tag, Share2, Linkedin, Twitter } from 'lucide-react'

interface BlogPostPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const posts = getAllBlogPosts()
  return posts.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: post.title,
    description: post.metaDescription,
    keywords: post.tags,
    authors: [{ name: post.author }],
    openGraph: {
      title: post.title,
      description: post.metaDescription,
      url: `https://behmn.com/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author],
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.metaDescription,
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params
  const post = getBlogPost(slug)

  if (!post) {
    notFound()
  }

  const allPosts = getAllBlogPosts()
  const relatedPosts = allPosts
    .filter(p => p.slug !== post.slug && p.category === post.category)
    .slice(0, 3)

  // Generate article structured data
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.metaDescription,
    author: {
      '@type': 'Organization',
      name: post.author,
    },
    publisher: {
      '@type': 'Organization',
      name: 'HMN',
      url: 'https://behmn.com',
      logo: {
        '@type': 'ImageObject',
        url: 'https://behmn.com/hmn_logo.png',
      },
    },
    datePublished: post.publishedAt,
    dateModified: post.publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://behmn.com/blog/${post.slug}`,
    },
    keywords: post.tags.join(', '),
  }

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />

      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="border-b border-gray-800">
          <div className="container max-w-4xl mx-auto px-6 py-4">
            <nav className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold">
                <span className="text-white">hmn</span>
              </Link>
              <div className="flex items-center gap-6">
                <Link href="/blog" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </Link>
                <Link
                  href="/"
                  className="px-4 py-2 bg-cyan-500 text-black rounded-full text-sm font-semibold hover:bg-cyan-400 transition-colors"
                >
                  Start Assessment
                </Link>
              </div>
            </nav>
          </div>
        </header>

        {/* Back Link */}
        <div className="container max-w-4xl mx-auto px-6 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>

        {/* Article Header */}
        <article className="container max-w-4xl mx-auto px-6 py-12">
          <header className="mb-12">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">
              {post.category}
            </span>
            <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-6 leading-tight">
              {post.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-400">
              <span>By {post.author}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {post.readTime}
              </span>
              <span>{new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}</span>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-2 mt-6">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-gray-800 rounded-full text-xs text-gray-300"
                >
                  {tag}
                </span>
              ))}
            </div>
          </header>

          {/* Article Content */}
          <div className="prose prose-invert prose-lg max-w-none">
            {post.content.split('\n\n').map((paragraph, index) => {
              if (paragraph.startsWith('## ')) {
                return (
                  <h2 key={index} className="text-2xl font-bold mt-10 mb-4">
                    {paragraph.replace('## ', '')}
                  </h2>
                )
              }
              if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                return (
                  <p key={index} className="text-xl font-semibold text-cyan-400 my-8">
                    {paragraph.replace(/\*\*/g, '')}
                  </p>
                )
              }
              if (paragraph.startsWith('- ')) {
                const items = paragraph.split('\n').filter(line => line.startsWith('- '))
                return (
                  <ul key={index} className="my-6 space-y-2">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-300">
                        {item.replace('- ', '').replace(/\*\*/g, '')}
                      </li>
                    ))}
                  </ul>
                )
              }
              if (paragraph.startsWith('1. ')) {
                const items = paragraph.split('\n').filter(line => /^\d+\./.test(line))
                return (
                  <ol key={index} className="my-6 space-y-2 list-decimal list-inside">
                    {items.map((item, i) => (
                      <li key={i} className="text-gray-300">
                        {item.replace(/^\d+\.\s*/, '').replace(/\*\*/g, '')}
                      </li>
                    ))}
                  </ol>
                )
              }
              if (paragraph.startsWith('---')) {
                return <hr key={index} className="my-10 border-gray-700" />
              }
              if (paragraph.trim() === '') {
                return null
              }
              return (
                <p key={index} className="text-gray-300 leading-relaxed my-4">
                  {paragraph}
                </p>
              )
            })}
          </div>

          {/* Share Section */}
          <div className="mt-12 pt-8 border-t border-gray-800">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 flex items-center gap-2">
                <Share2 className="w-4 h-4" />
                Share
              </span>
              <a
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://behmn.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`https://behmn.com/blog/${post.slug}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-gray-800 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 p-8 bg-gradient-to-r from-cyan-900/30 to-blue-900/30 rounded-2xl border border-cyan-800/30">
            <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Organization?</h3>
            <p className="text-gray-400 mb-6">
              Discover your AI readiness score and get personalized recommendations for building an AI-ready culture.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors"
            >
              Start Your AI Assessment
            </Link>
          </div>
        </article>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <section className="border-t border-gray-800 py-16">
            <div className="container max-w-4xl mx-auto px-6">
              <h2 className="text-2xl font-bold mb-8">Related Articles</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedPosts.map((relatedPost) => (
                  <Link
                    key={relatedPost.slug}
                    href={`/blog/${relatedPost.slug}`}
                    className="group block bg-gray-900 rounded-xl p-5 hover:bg-gray-800 transition-colors"
                  >
                    <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                      {relatedPost.category}
                    </span>
                    <h3 className="text-lg font-bold mt-2 mb-2 group-hover:text-cyan-400 transition-colors line-clamp-2">
                      {relatedPost.title}
                    </h3>
                    <span className="text-xs text-gray-500">{relatedPost.readTime}</span>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-gray-800 py-12">
          <div className="container max-w-4xl mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start gap-8">
              <div>
                <span className="text-2xl font-bold">hmn</span>
                <p className="text-gray-500 mt-2">AI-Powered Organizational Transformation</p>
              </div>
              <div className="text-gray-400 text-sm">
                <p>Miami, FL</p>
                <p className="mt-2">+1 (937) 922-3928</p>
                <p>hello@behmn.com</p>
              </div>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-500 text-sm">
              &copy; {new Date().getFullYear()} HMN. All rights reserved.
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}
