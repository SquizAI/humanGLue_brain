import { Metadata } from 'next'
import Link from 'next/link'
import { getAllBlogPosts } from '@/lib/blog-posts'
import { ArrowRight, Clock, Tag } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Blog - AI Transformation Insights',
  description: 'Expert insights on AI adoption, organizational transformation, leadership development, and building AI-ready cultures. Learn how to navigate the human side of AI transformation.',
  openGraph: {
    title: 'HMN Blog - AI Transformation Insights',
    description: 'Expert insights on AI adoption, organizational transformation, and building AI-ready cultures.',
    url: 'https://behmn.com/blog',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HMN Blog - AI Transformation Insights',
    description: 'Expert insights on AI adoption, organizational transformation, and building AI-ready cultures.',
  },
}

export default function BlogPage() {
  const posts = getAllBlogPosts()
  const featuredPost = posts[0]
  const recentPosts = posts.slice(1)

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800">
        <div className="container max-w-6xl mx-auto px-6 py-4">
          <nav className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold">
              <span className="text-white">hmn</span>
            </Link>
            <div className="flex items-center gap-6">
              <Link href="/solutions" className="text-gray-300 hover:text-white transition-colors">
                Solutions
              </Link>
              <Link href="/blog" className="text-cyan-400">
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

      {/* Hero Section */}
      <section className="py-16 border-b border-gray-800">
        <div className="container max-w-6xl mx-auto px-6">
          <h1 className="text-5xl font-bold mb-4">AI Transformation Insights</h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Expert perspectives on navigating the human side of AI adoption.
            Strategy, culture, leadership, and the future of work.
          </p>
        </div>
      </section>

      {/* Featured Post */}
      {featuredPost && (
        <section className="py-12 border-b border-gray-800">
          <div className="container max-w-6xl mx-auto px-6">
            <span className="text-cyan-400 text-sm font-semibold uppercase tracking-wider">Featured</span>
            <Link href={`/blog/${featuredPost.slug}`} className="block mt-4 group">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 group-hover:text-cyan-400 transition-colors">
                {featuredPost.title}
              </h2>
              <p className="text-gray-400 text-lg mb-6 max-w-3xl">
                {featuredPost.excerpt}
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {featuredPost.readTime}
                </span>
                <span className="flex items-center gap-1">
                  <Tag className="w-4 h-4" />
                  {featuredPost.category}
                </span>
                <span>{featuredPost.publishedAt}</span>
              </div>
              <span className="inline-flex items-center gap-2 mt-4 text-cyan-400 font-semibold group-hover:gap-3 transition-all">
                Read Article <ArrowRight className="w-4 h-4" />
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Recent Posts Grid */}
      <section className="py-16">
        <div className="container max-w-6xl mx-auto px-6">
          <h2 className="text-2xl font-bold mb-8">Recent Articles</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentPosts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group block bg-gray-900 rounded-xl p-6 hover:bg-gray-800 transition-colors"
              >
                <span className="text-cyan-400 text-xs font-semibold uppercase tracking-wider">
                  {post.category}
                </span>
                <h3 className="text-xl font-bold mt-2 mb-3 group-hover:text-cyan-400 transition-colors">
                  {post.title}
                </h3>
                <p className="text-gray-400 text-sm mb-4 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime}
                  </span>
                  <span>{post.publishedAt}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border-t border-gray-800">
        <div className="container max-w-6xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Organization?</h2>
          <p className="text-gray-400 mb-8 max-w-2xl mx-auto">
            Discover your AI readiness score and get personalized recommendations for building an AI-ready culture.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-8 py-4 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors"
          >
            Start Your AI Assessment <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="container max-w-6xl mx-auto px-6">
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
  )
}
