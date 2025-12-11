import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { blogPosts } from '@/lib/blogData'
import StructuredData from '@/components/StructuredData'
import { ArrowLeftIcon, CalendarDaysIcon, ClockIcon, UserIcon, TagIcon } from '@heroicons/react/24/outline'

// Generate static params for all blog posts
export async function generateStaticParams() {
    return blogPosts.map((post) => ({
        slug: post.id,
    }))
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.id === params.slug)
    if (!post) return {}

    return {
        title: `${post.title} | FinleyBook Blog`,
        description: post.excerpt,
        openGraph: {
            title: post.title,
            description: post.excerpt,
            images: [post.image],
        },
        alternates: {
            canonical: `/blog/${post.id}`,
        },
    }
}

export default function BlogPost({ params }: { params: { slug: string } }) {
    const post = blogPosts.find((p) => p.id === params.slug)

    if (!post) {
        notFound()
    }

    return (
        <>
            <StructuredData type="article" data={{ ...post, slug: post.id }} />
            <StructuredData
                type="breadcrumbs"
                data={[
                    { name: 'Home', url: '/' },
                    { name: 'Blog', url: '/blog' },
                    { name: post.title, url: `/blog/${post.id}` }
                ]}
            />
            <div className="min-h-screen bg-white pb-20">
                {/* Hero Image */}
                <div className="relative h-96 w-full">
                    <Image
                        src={post.image}
                        alt={post.title}
                        fill
                        className="object-cover"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
                    <div className="absolute bottom-0 left-0 w-full p-8 md:p-12 text-white">
                        <div className="max-w-4xl mx-auto">
                            <Link
                                href="/blog"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                Back to Blog
                            </Link>
                            <h1 className="text-3xl md:text-5xl font-bold mb-6 leading-tight">
                                {post.title}
                            </h1>
                            <div className="flex flex-wrap gap-6 text-sm md:text-base text-white/90">
                                <div className="flex items-center gap-2">
                                    <UserIcon className="w-5 h-5" />
                                    {post.author}
                                </div>
                                <div className="flex items-center gap-2">
                                    <CalendarDaysIcon className="w-5 h-5" />
                                    {post.publishDate}
                                </div>
                                <div className="flex items-center gap-2">
                                    <ClockIcon className="w-5 h-5" />
                                    {post.readTime}
                                </div>
                                <span className="bg-white/20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-sm">
                                    {post.category}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
                    <div className="prose prose-lg prose-indigo mx-auto max-w-none text-gray-900 prose-headings:text-gray-900 prose-p:text-gray-800 prose-strong:text-gray-900 prose-li:text-gray-800">
                        <div dangerouslySetInnerHTML={{ __html: post.content }} />
                    </div>

                    {/* Tags */}
                    <div className="mt-12 pt-8 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {post.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-sm"
                                >
                                    <TagIcon className="w-3 h-3" />
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}
