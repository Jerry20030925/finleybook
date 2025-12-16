import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/dashboard/'], // Protect API and private dashboard routes from indexing
    },
    sitemap: 'https://finleybook.com/sitemap.xml',
  }
}