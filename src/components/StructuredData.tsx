'use client'

interface StructuredDataProps {
  type: 'website' | 'organization' | 'software' | 'article' | 'product' | 'faq' | 'blog' | 'breadcrumbs'
  data?: any
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const baseUrl = 'https://finleybook.com'

  const generateStructuredData = () => {
    switch (type) {
      case 'website':
        const websiteData = {
          '@type': 'WebSite',
          '@id': `${baseUrl}/#website`,
          url: baseUrl,
          name: 'FinleyBook',
          description: 'FinleyBook is an intelligent personal finance platform providing AI-driven budget planning, investment tracking, wealth analysis, and tax management services.',
          inLanguage: 'en-AU',
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
          url: baseUrl,
          logo: `${baseUrl}/logo.png`, // Google prefers a direct image URL in 'logo' field or ImageObject
          sameAs: [
            'https://www.linkedin.com/company/finleybook',
            'https://www.crunchbase.com/organization/finleybook',
            'https://www.tiktok.com/@finleybook1?_r=1&_t=ZS-923DYtBDdrs',
            'https://www.instagram.com/finleybook',
            'https://x.com/finleybook1'
          ],
          description: 'FinleyBook is a premier AI-powered personal finance platform helping users build wealth through automated tracking and smart rewards.',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            areaServed: ['AU', 'US'],
            availableLanguage: ['en', 'zh']
          },
          foundingDate: '2024'
        }
        return organizationData

      case 'breadcrumbs':
        if (!data) return null
        const breadcrumbData = {
          '@type': 'BreadcrumbList',
          itemListElement: data.map((item: any, index: number) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url ? `${baseUrl}${item.url}` : undefined
          }))
        }
        return breadcrumbData

      case 'software':
        const softwareData = {
          '@type': 'SoftwareApplication',
          name: 'FinleyBook',
          description: 'The Intelligent AI Wealth Platform. Automated net worth tracking, smart expense analytics, and premium cashback optimization.',
          url: baseUrl,
          applicationCategory: 'FinanceApplication',
          applicationSubCategory: 'PersonalFinanceApplication',
          operatingSystem: 'Windows, macOS, Android, iOS',
          screenshot: `${baseUrl}/og-image.png`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            availability: 'https://schema.org/InStock'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 4.9,
            ratingCount: 2048,
            bestRating: 5,
            worstRating: 1
          },
          featureList: [
            'AI Wealth Management',
            'Net Worth Tracking',
            'Smart Expense Analytics',
            'Premium Cashback Rewards',
            'Financial Goal Planning'
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

      case 'faq':
        if (!data) return null
        const faqData = {
          '@type': 'FAQPage',
          mainEntity: data.map((item: any) => ({
            '@type': 'Question',
            name: item.question,
            acceptedAnswer: {
              '@type': 'Answer',
              text: item.answer
            }
          }))
        }
        return faqData

      case 'product':
        if (!data) return null
        const productData = {
          '@type': 'Product',
          name: data.name,
          image: data.image,
          description: data.description,
          brand: {
            '@type': 'Brand',
            name: data.merchant
          },
          offers: {
            '@type': 'Offer',
            url: `${baseUrl}/wealth/product/${data.id}`,
            priceCurrency: 'USD',
            price: data.price,
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition'
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '124'
          }
        }
        return productData


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