// StructuredData component for SEO

interface StructuredDataProps {
  type: 'website' | 'organization' | 'software' | 'article' | 'product' | 'faq' | 'blog' | 'breadcrumbs' | 'service'
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
          description: 'FinleyBook is a professional personal finance platform delivering AI-guided bookkeeping, wealth analysis, and decision-grade reporting.',
          inLanguage: 'en-AU',
          potentialAction: {
            '@type': 'SearchAction',
            target: {
              '@type': 'EntryPoint',
              urlTemplate: `${baseUrl}/shop?q={search_term_string}`
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
          description: 'FinleyBook provides professional AI wealth intelligence for households and independent professionals who need clear financial decisions.',
          contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'support@finleybook.com',
            areaServed: ['AU', 'US', 'NZ', 'GB'],
            availableLanguage: ['English', 'Chinese']
          },
          foundingDate: '2024',
          funder: {
            '@type': 'Organization',
            name: 'FinleyBook AI'
          }
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
          description: 'A professional AI wealth platform with automated net worth tracking, smart expense analytics, and decision-grade reporting.',
          url: baseUrl,
          applicationCategory: 'FinanceApplication',
          applicationSubCategory: 'PersonalFinanceApplication',
          operatingSystem: 'Windows, macOS, Android, iOS',
          screenshot: `${baseUrl}/og-image.png`,
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            priceValidUntil: '2026-12-31',
            availability: 'https://schema.org/InStock',
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'USD'
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: ['AU', 'US', 'NZ', 'GB']
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 0,
                  unitCode: 'DAY'
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 0,
                  unitCode: 'DAY'
                }
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: ['AU', 'US', 'NZ', 'GB'],
              returnPolicyCategory: 'https://schema.org/MerchantReturnNotPermitted',
              merchantReturnDays: 0
            }
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
            'Professional Financial Reporting',
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
          inLanguage: 'en-AU',
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
          inLanguage: 'en-AU'
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
            priceValidUntil: '2026-12-31',
            availability: 'https://schema.org/InStock',
            itemCondition: 'https://schema.org/NewCondition',
            shippingDetails: {
              '@type': 'OfferShippingDetails',
              shippingRate: {
                '@type': 'MonetaryAmount',
                value: '0',
                currency: 'USD'
              },
              shippingDestination: {
                '@type': 'DefinedRegion',
                addressCountry: ['AU', 'US', 'NZ', 'GB']
              },
              deliveryTime: {
                '@type': 'ShippingDeliveryTime',
                handlingTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 0,
                  maxValue: 1,
                  unitCode: 'DAY'
                },
                transitTime: {
                  '@type': 'QuantitativeValue',
                  minValue: 1,
                  maxValue: 7,
                  unitCode: 'DAY'
                }
              }
            },
            hasMerchantReturnPolicy: {
              '@type': 'MerchantReturnPolicy',
              applicableCountry: ['AU', 'US', 'NZ', 'GB'],
              returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
              merchantReturnDays: 30,
              returnMethod: 'https://schema.org/ReturnByMail',
              returnFees: 'https://schema.org/FreeReturn'
            }
          },
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: '124'
          }
        }
        return productData


      case 'service':
        if (!data) return null
        const serviceData = {
          '@type': 'Service',
          name: data.name,
          serviceType: data.type,
          provider: {
            '@type': 'Organization',
            '@id': `${baseUrl}/#organization`
          },
          description: data.description,
          areaServed: {
            '@type': 'Country',
            name: 'Australia'
          },
          offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD',
            priceValidUntil: '2026-12-31'
          }
        }
        return serviceData

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
