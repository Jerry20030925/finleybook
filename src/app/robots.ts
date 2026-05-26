import { MetadataRoute } from 'next'

const DEFAULT_SITE_URL = 'https://finleybook.com'

function resolveBaseUrl(): string {
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (vercelProductionUrl ? `https://${vercelProductionUrl}` : DEFAULT_SITE_URL)

  return configuredSiteUrl.replace(/\/+$/, '')
}

export default function robots(): MetadataRoute.Robots {
  const baseUrl = resolveBaseUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/wallet/',
          '/settings/',
          '/goals/',
          '/transactions/',
          '/reports/',
          '/budget/',
          '/profile/',
          '/refer/',
          '/subscription/',
          '/redeem/',
          '/gift/',
          '/verify-firebase',
          '/shop/',
          '/rewards/',
          '/wealth/',
          '/debug',
          '/email-test',
        ],
      },
    ],
    host: baseUrl,
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
