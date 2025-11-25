'use client'

interface StructuredDataProps {
  type: 'website' | 'organization' | 'software' | 'blog' | 'article'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const generateStructuredData = () => {
    const baseUrl = 'https://finleybook.com'
    
    switch (type) {
      case 'website':
        const websiteData = {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: 'FinleyBook',
          description: 'FinleyBook是一个智能的个人财务管理平台，提供AI驱动的预算规划、投资跟踪、理财分析和税务管理服务',
          inLanguage: 'zh-CN',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/search?q={search_term_string}`
            },
            'query-input': 'required name=search_term_string'
          },
          publisher: {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`
          }
        }
        return websiteData

      case 'organization':
        const organizationData = {
          '@type': 'Organization',
          '@id': `${baseUrl}/#organization`,
          name: 'FinleyBook',
          alternateName: 'FinleyBook 智能财务管理',
          description: 'AI驱动的个人财务管理解决方案提供商',
          url: baseUrl,
          logo: {
            '@type': 'ImageObject',
            url: `${baseUrl}/logo.png`,
            width: 512,
            height: 512
          },
          image: {
            '@type': 'ImageObject',
            url: `${baseUrl}/og-image.jpg`,
            width: 1200,
            height: 630
          },
          foundingDate: '2023-01-01',
          founder: [
            {
              '@type': 'Person',
              name: '张明',
              jobTitle: '创始人兼CEO'
            }
          ],
          contactPoint: [
            {
              '@type': 'ContactPoint',
              telephone: '+86-400-123-4567',
              contactType: 'customer service',
              areaServed: 'CN',
              availableLanguage: 'Chinese'
            }
          ],
          sameAs: [
            'https://weibo.com/finleybook',
            'https://twitter.com/finleybook',
            'https://linkedin.com/company/finleybook'
          ]
        }
        return organizationData

      case 'software':
        const softwareData = {
          '@type': 'SoftwareApplication',
          name: 'FinleyBook',
          description: '智能个人财务管理平台',
          url: baseUrl,
          applicationCategory: 'FinanceApplication',
          operatingSystem: 'Web Browser, iOS, Android',
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'CNY',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 4.8,
            ratingCount: 1250,
            bestRating: 5,
            worstRating: 1
          },
          featureList: [
            '智能预算管理',
            'AI财务分析',
            '投资跟踪',
            '税务规划',
            '财务目标设定',
            '支出分类'
          ]
        }
        return softwareData

      case 'blog':
        const blogData = {
          '@type': 'WebSite',
          '@id': `${baseUrl}/blog/#blog`,
          url: `${baseUrl}/blog`,
          name: 'FinleyBook 财务知识库',
          description: '获取最新的财务管理技巧、投资策略和理财知识',
          inLanguage: 'zh-CN',
          isPartOf: {
            '@type': 'WebSite',
            '@id': `${baseUrl}/#website`
          }
        }
        return blogData

      case 'article':
        if (!data) return null
        const articleData = {
          '@type': 'Article',
          '@id': `${baseUrl}/blog/${data.slug}/#article`,
          headline: data.title,
          description: data.excerpt,
          image: data.image,
          datePublished: data.publishedTime,
          dateModified: data.modifiedTime || data.publishedTime,
          author: {
            '@type': 'Person',
            name: data.author,
            url: `${baseUrl}/authors/${data.author.toLowerCase().replace(' ', '-')}`
          },
          publisher: {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`
          },
          mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${baseUrl}/blog/${data.slug}`
          },
          articleSection: data.category,
          keywords: data.tags?.join(', '),
          wordCount: data.wordCount,
          inLanguage: 'zh-CN'
        }
        return articleData

      default:
        return null
    }
  }

  const structuredData = generateStructuredData()

  if (!structuredData) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          '@context': 'https://schema.org',
          ...structuredData
        })
      }}
    />
  )
}