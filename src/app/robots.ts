import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/dashboard/', '/settings/', '/admin/', '/profile/', '/wallet/', '/debug/'],
    },
    sitemap: 'https://finleybook.com/sitemap.xml',
  }
}