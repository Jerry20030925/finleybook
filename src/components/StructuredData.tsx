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
          alternateName: 'FinleyBook AI Finance',
          description: 'FinleyBook is an AI-powered personal finance platform helping Australians track expenses and earn cashback.',
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
          sameAs: [
            'https://www.linkedin.com/company/finleybook',
            'https://www.crunchbase.com/organization/finleybook',
            'https://www.tiktok.com/@finleybook',
            'https://www.instagram.com/finleybook',
            'https://x.com/finleybook1'
          ],
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            areaServed: ['AU', 'US'],
            availableLanguage: ['en', 'zh']
          },
          foundingDate: '2024'
        }
        return organizationData

      case 'software':
        const softwareData = {
          '@type': 'SoftwareApplication',
          name: 'FinleyBook',
          description: 'The #1 AI Wealth Tracker & Cashback App. Find price glitches, earn double rewards, and track your net worth automatically.',
          url: baseUrl,
          applicationCategory: 'FinanceApplication',
          applicationSubCategory: 'ShoppingApplication',
          operatingSystem: 'Windows, macOS, Android, iOS',
          screenshot: `${baseUrl}/og-image.png`,
          offers: [
            {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              name: 'Free Starter Plan'
            },
            {
              '@type': 'Offer',
              price: '9.99',
              priceCurrency: 'USD',
              availability: 'https://schema.org/InStock',
              name: 'Pro Plan (Monthly)'
            }
          ],
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: 4.9,
            ratingCount: 2048,
            bestRating: 5,
            worstRating: 1
          },
          featureList: [
            'AI Wealth Tracker',
            'Cashback Glitch Finder',
            'Bank Bounties Hunter',
            'Expense Manager',
            'Net Worth Calculator'
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