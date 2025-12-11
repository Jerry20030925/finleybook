export interface BlogPost {
    id: string
    title: string
    excerpt: string
    author: string
    publishDate: string
    readTime: string
    category: string
    tags: string[]
    image: string
    featured: boolean
    content?: string // For full post view
    // Success Story Specifics
    isSuccessStory?: boolean
    successMetrics?: {
        metric: string // e.g. "Saved"
        value: string // e.g. "$10,000"
        duration: string // e.g. "6 months"
    }
}

// Mock Data (Centralized source of truth)
const BLOG_POSTS: BlogPost[] = [
    {
        id: 'personal-budget-mastery',
        title: '个人预算管理完全指南：从入门到精通',
        excerpt: '学习如何制定有效的个人预算，掌控您的财务生活。本文将介绍50/30/20规则、零基预算法等实用方法。',
        author: '张明',
        publishDate: '2024年11月20日',
        readTime: '8分钟',
        category: '预算规划',
        tags: ['预算管理', '个人理财', '财务规划'],
        image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        featured: true
    },
    {
        id: 'sarah-saved-10k',
        title: 'How Sarah Crushed $5k Debt in 90 Days',
        excerpt: 'Using the "Snowball Method" and FinleyBook cashbacks, Sarah cleared her credit card debt faster than she thought possible.',
        author: 'Sarah J.',
        publishDate: '2024年12月01日',
        readTime: '5分钟',
        category: 'Success Stories',
        tags: ['Debt Free', 'Success Story'],
        image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
        featured: true,
        isSuccessStory: true,
        successMetrics: {
            metric: 'Debt Paid',
            value: '$5,000',
            duration: '3 Months'
        }
    }
    // ... add more from original list if needed
]

export const getAllPosts = async (): Promise<BlogPost[]> => {
    // In real app: fetch from CMS or Markdown files
    return new Promise(resolve => setTimeout(() => resolve(BLOG_POSTS), 100))
}

export const getPostBySlug = async (slug: string): Promise<BlogPost | undefined> => {
    return new Promise(resolve => setTimeout(() => resolve(BLOG_POSTS.find(p => p.id === slug)), 100))
}

export const getSuccessStories = async (): Promise<BlogPost[]> => {
    return new Promise(resolve => setTimeout(() => resolve(BLOG_POSTS.filter(p => p.isSuccessStory)), 100))
}
