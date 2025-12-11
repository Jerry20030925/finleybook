import { MetadataRoute } from 'next'
import { PRODUCTS } from '@/data/products'
import { blogPosts } from '@/lib/blogData'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://finleybook.com'

  const productRoutes = PRODUCTS.map((product) => ({
    url: `${baseUrl}/wealth/product/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const blogRoutes = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.id}`,
    lastModified: new Date(post.publishDate), // Use publish date or current date
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const routes = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/wealth`,
      lastModified: new Date(),
      changeFrequency: 'hourly',
      priority: 1,
    },
    {
      url: `${baseUrl}/shop`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/wallet`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },

    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },

  ]

  return [...routes, ...productRoutes, ...blogRoutes] as MetadataRoute.Sitemap
}