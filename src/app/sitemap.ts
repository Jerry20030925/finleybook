import { MetadataRoute } from 'next'
import { blogPosts } from '@/lib/blogData'

type SitemapEntry = MetadataRoute.Sitemap[number]
type ChangeFrequency = NonNullable<SitemapEntry['changeFrequency']>
type StaticRouteConfig = {
  path: string
  changeFrequency: ChangeFrequency
  priority: number
}

const DEFAULT_SITE_URL = 'https://finleybook.com'

function parseDate(value?: string): Date | null {
  if (!value) {
    return null
  }

  const numericValue = Number(value)
  const parsed = Number.isFinite(numericValue) ? new Date(numericValue) : new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function resolveBaseUrl(): string {
  const vercelProductionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL
  const configuredSiteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ??
    process.env.SITE_URL ??
    (vercelProductionUrl ? `https://${vercelProductionUrl}` : DEFAULT_SITE_URL)

  return configuredSiteUrl.replace(/\/+$/, '')
}

function resolveLastModifiedFallback(now: Date): Date {
  const fromEnv = process.env.SITEMAP_LAST_MODIFIED ?? process.env.VERCEL_DEPLOYMENT_CREATED_AT
  const parsed = parseDate(fromEnv)
  return parsed && parsed <= now ? parsed : now
}

function safeContentDate(value: string | undefined, fallback: Date, now: Date): Date {
  const parsed = parseDate(value)
  if (!parsed || parsed > now) {
    return fallback
  }
  return parsed
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const baseUrl = resolveBaseUrl()
  const fallbackLastModified = resolveLastModifiedFallback(now)

  const staticRouteConfigs: StaticRouteConfig[] = [
    { path: '', changeFrequency: 'daily', priority: 1.0 },
    { path: '/pricing', changeFrequency: 'weekly', priority: 0.88 },
    { path: '/subscribe', changeFrequency: 'weekly', priority: 0.86 },
    { path: '/features/wealth-tracker', changeFrequency: 'weekly', priority: 0.82 },
    { path: '/features/cashback-rewards', changeFrequency: 'weekly', priority: 0.80 },
    { path: '/blog', changeFrequency: 'daily', priority: 0.78 },
    { path: '/about', changeFrequency: 'monthly', priority: 0.62 },
    { path: '/security', changeFrequency: 'monthly', priority: 0.58 },
    { path: '/help', changeFrequency: 'monthly', priority: 0.56 },
    { path: '/privacy', changeFrequency: 'yearly', priority: 0.44 },
    { path: '/terms', changeFrequency: 'yearly', priority: 0.44 },
    { path: '/unsubscribe', changeFrequency: 'yearly', priority: 0.30 },
  ]

  const staticRoutes: SitemapEntry[] = staticRouteConfigs.map(({ path, ...meta }) => ({
    url: `${baseUrl}${path}`,
    lastModified: fallbackLastModified,
    ...meta,
  }))

  const blogRoutes: SitemapEntry[] = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${encodeURIComponent(post.id)}`,
    lastModified: safeContentDate(post.publishDate, fallbackLastModified, now),
    changeFrequency: 'monthly',
    priority: 0.66,
  }))

  const uniqueEntries = new Map<string, SitemapEntry>()
  for (const entry of [...staticRoutes, ...blogRoutes]) {
    uniqueEntries.set(entry.url, entry)
  }

  return Array.from(uniqueEntries.values()).sort((a, b) => a.url.localeCompare(b.url))
}
