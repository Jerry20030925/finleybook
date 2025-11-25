

'use client'

import { useLanguage } from '@/components/LanguageProvider'
import Link from 'next/link'

interface Section {
  title: string
  content?: string
  items?: string[]
  subsections?: {
    title: string
    content?: string
    items?: string[]
  }[]
  extraContent?: string
  extraItems?: string[]
  contactInfo?: Record<string, { title: string; value: string }>
}

const translations: Record<string, {
  title: string
  lastUpdated: string
  intro: string
  sections: Section[]
  footer: {
    copyright: string
    links: {
      terms: string
      about: string
      blog: string
    }
  }
}> = {
  zh: {
    title: '隐私政策',
    lastUpdated: '最后更新时间：2024年11月25日',
    intro: 'FinleyBook（以下简称"我们"）非常重视您的隐私保护。本隐私政策详细说明了我们在您使用我们的服务时如何收集、使用、保护和分享您的个人信息。',
    sections: [
      {
        title: '1. 信息收集',
        subsections: [
          {
            title: '1.1 我们收集的信息类型',
            items: [
              '账户信息：包括您的姓名、电子邮件地址、电话号码等注册信息',
              '财务信息：您主动输入的收入、支出、预算等财务数据',
              '设备信息：设备型号、操作系统、浏览器类型等技术信息',
              '使用数据：您如何使用我们的服务，包括访问时间、功能使用情况等',
              '位置信息：在您同意的情况下，我们可能收集您的地理位置信息'
            ]
          },
          {
            title: '1.2 信息收集方式',
            items: [
              '您直接向我们提供的信息',
              '您使用我们服务时自动收集的信息',
              '从第三方合作伙伴获得的信息（在法律允许的范围内）'
            ]
          }
        ]
      },
      {
        title: '2. 信息使用',
        content: '我们使用收集的信息用于以下目的：',
        items: [
          '提供、维护和改进我们的服务',
          '处理您的交易和管理您的账户',
          '向您发送服务相关的通知和更新',
          '提供客户支持和技术支持',
          '分析服务使用情况，优化用户体验',
          '防范欺诈和确保服务安全',
          '遵守法律法规要求'
        ]
      },
      {
        title: '3. 信息分享',
        content: '我们不会出售、交易或转让您的个人信息给第三方。但在以下情况下，我们可能会分享您的信息：',
        items: [
          '服务提供商：与帮助我们运营业务的第三方服务提供商（如云存储、数据分析）',
          '法律要求：应法律要求、法院命令或政府部门要求',
          '业务转让：在公司合并、收购或资产出售的情况下',
          '保护权益：为保护我们或他人的权利、财产或安全',
          '用户同意：在获得您明确同意的其他情况下'
        ]
      },
      {
        title: '4. 数据安全',
        subsections: [
          {
            title: '4.1 安全措施',
            content: '我们采用多层次的安全措施保护您的个人信息：',
            items: [
              '使用SSL加密技术保护数据传输',
              '采用先进的加密算法保护存储的数据',
              '实施严格的访问控制和身份验证',
              '定期进行安全审计和漏洞评估',
              '员工接受隐私和安全培训'
            ]
          },
          {
            title: '4.2 数据存储',
            content: '您的数据存储在安全的服务器上，我们使用业界标准的安全措施来保护这些数据。数据存储期限将根据业务需要和法律要求确定。'
          }
        ]
      },
      {
        title: '5. 您的权利',
        content: '您对自己的个人信息享有以下权利：',
        items: [
          '访问权：您有权了解我们收集了您的哪些个人信息',
          '更正权：您有权要求我们更正不准确的个人信息',
          '删除权：在特定情况下，您有权要求我们删除您的个人信息',
          '限制处理权：在特定情况下，您有权要求我们限制处理您的个人信息',
          '数据可携权：您有权以结构化、常用和机器可读的格式接收您的个人信息',
          '拒绝权：您有权拒绝我们处理您的个人信息'
        ],
        extraContent: '如需行使上述权利，请通过以下方式联系我们：',
        extraItems: [
          '电子邮件：privacy@finleybook.com',
          '客服热线：400-123-4567',
          '在线客服：登录您的账户后使用在线客服功能'
        ]
      },
      {
        title: '6. Cookie 和类似技术',
        content: '我们使用 Cookie 和类似技术来：',
        items: [
          '记住您的登录状态和偏好设置',
          '分析网站流量和用户行为',
          '提供个性化的内容和广告',
          '改进我们的服务质量'
        ],
        extraContent: '您可以通过浏览器设置来管理 Cookie 偏好，但这可能会影响某些服务功能的使用。'
      },
      {
        title: '7. 儿童隐私',
        content: '我们的服务不面向18岁以下的儿童。我们不会故意收集儿童的个人信息。如果我们发现收集了儿童的个人信息，我们将立即删除相关信息。如果您认为我们可能收集了您孩子的信息，请立即联系我们。'
      },
      {
        title: '8. 国际数据传输',
        content: '您的信息可能会被传输到您所在国家/地区以外的其他国家/地区进行处理。我们将采取适当的保护措施，确保您的个人信息在这些传输过程中得到充分保护，符合适用的数据保护法律。'
      },
      {
        title: '9. 政策更新',
        content: '我们可能会不时更新此隐私政策。当我们做出重大变更时，我们将通过以下方式通知您：',
        items: [
          '在我们的网站上发布更新的政策',
          '通过电子邮件通知您',
          '在应用程序中显示通知'
        ],
        extraContent: '您继续使用我们的服务即表示您接受更新后的隐私政策。'
      },
      {
        title: '10. 联系我们',
        content: '如果您对本隐私政策有任何疑问或建议，请随时联系我们：',
        contactInfo: {
          email: { title: '电子邮件', value: 'privacy@finleybook.com' },
          phone: { title: '客服电话', value: '400-123-4567' },
          hours: { title: '工作时间', value: '周一至周五 9:00-18:00' },
          address: { title: '通讯地址', value: '北京市朝阳区xxx路xxx号' }
        }
      }
    ],
    footer: {
      copyright: '© 2025 FinleyBook. 保留所有权利。',
      links: {
        terms: '服务条款',
        about: '关于我们',
        blog: '博客'
      }
    }
  },
  en: {
    title: 'Privacy Policy',
    lastUpdated: 'Last Updated: November 25, 2024',
    intro: 'FinleyBook ("we", "us", or "our") takes your privacy very seriously. This Privacy Policy explains in detail how we collect, use, protect, and share your personal information when you use our services.',
    sections: [
      {
        title: '1. Information Collection',
        subsections: [
          {
            title: '1.1 Types of Information We Collect',
            items: [
              'Account Information: Registration information including your name, email address, phone number, etc.',
              'Financial Information: Income, expenses, budget, and other financial data you voluntarily input.',
              'Device Information: Technical information such as device model, operating system, browser type, etc.',
              'Usage Data: How you use our services, including access times, feature usage, etc.',
              'Location Information: With your consent, we may collect your geographic location information.'
            ]
          },
          {
            title: '1.2 How We Collect Information',
            items: [
              'Information you provide directly to us',
              'Information automatically collected when you use our services',
              'Information obtained from third-party partners (where permitted by law)'
            ]
          }
        ]
      },
      {
        title: '2. Use of Information',
        content: 'We use the collected information for the following purposes:',
        items: [
          'To provide, maintain, and improve our services',
          'To process your transactions and manage your account',
          'To send you service-related notifications and updates',
          'To provide customer support and technical assistance',
          'To analyze service usage and optimize user experience',
          'To prevent fraud and ensure service security',
          'To comply with legal and regulatory requirements'
        ]
      },
      {
        title: '3. Information Sharing',
        content: 'We do not sell, trade, or transfer your personal information to third parties. However, we may share your information in the following circumstances:',
        items: [
          'Service Providers: With third-party service providers who help us operate our business (e.g., cloud storage, data analysis)',
          'Legal Requirements: In response to legal requirements, court orders, or government requests',
          'Business Transfers: In the event of a merger, acquisition, or sale of assets',
          'Protection of Rights: To protect our rights, property, or safety, or that of others',
          'User Consent: In other circumstances where we have obtained your explicit consent'
        ]
      },
      {
        title: '4. Data Security',
        subsections: [
          {
            title: '4.1 Security Measures',
            content: 'We employ multi-layered security measures to protect your personal information:',
            items: [
              'Use of SSL encryption technology to protect data transmission',
              'Adoption of advanced encryption algorithms to protect stored data',
              'Implementation of strict access controls and authentication',
              'Regular security audits and vulnerability assessments',
              'Privacy and security training for employees'
            ]
          },
          {
            title: '4.2 Data Storage',
            content: 'Your data is stored on secure servers, and we use industry-standard security measures to protect this data. Data retention periods will be determined based on business needs and legal requirements.'
          }
        ]
      },
      {
        title: '5. Your Rights',
        content: 'You have the following rights regarding your personal information:',
        items: [
          'Right of Access: You have the right to know what personal information we have collected about you',
          'Right to Rectification: You have the right to request that we correct inaccurate personal information',
          'Right to Erasure: In certain circumstances, you have the right to request that we delete your personal information',
          'Right to Restriction of Processing: In certain circumstances, you have the right to request that we restrict the processing of your personal information',
          'Right to Data Portability: You have the right to receive your personal information in a structured, commonly used, and machine-readable format',
          'Right to Object: You have the right to object to our processing of your personal information'
        ],
        extraContent: 'To exercise these rights, please contact us via:',
        extraItems: [
          'Email: privacy@finleybook.com',
          'Customer Service Hotline: 400-123-4567',
          'Online Support: Log in to your account and use the online support feature'
        ]
      },
      {
        title: '6. Cookies and Similar Technologies',
        content: 'We use Cookies and similar technologies to:',
        items: [
          'Remember your login status and preferences',
          'Analyze website traffic and user behavior',
          'Provide personalized content and advertising',
          'Improve our service quality'
        ],
        extraContent: 'You can manage Cookie preferences through your browser settings, but this may affect the use of certain service features.'
      },
      {
        title: '7. Children\'s Privacy',
        content: 'Our services are not intended for children under 18. We do not knowingly collect personal information from children. If we discover that we have collected personal information from a child, we will delete it immediately. If you believe we might have collected information from your child, please contact us immediately.'
      },
      {
        title: '8. International Data Transfers',
        content: 'Your information may be transferred to and processed in countries/regions other than your own. We will take appropriate protective measures to ensure that your personal information receives adequate protection during these transfers, in compliance with applicable data protection laws.'
      },
      {
        title: '9. Policy Updates',
        content: 'We may update this Privacy Policy from time to time. When we make significant changes, we will notify you by:',
        items: [
          'Posting the updated policy on our website',
          'Notifying you via email',
          'Displaying a notification in the application'
        ],
        extraContent: 'Your continued use of our services constitutes your acceptance of the updated Privacy Policy.'
      },
      {
        title: '10. Contact Us',
        content: 'If you have any questions or suggestions regarding this Privacy Policy, please feel free to contact us:',
        contactInfo: {
          email: { title: 'Email', value: 'privacy@finleybook.com' },
          phone: { title: 'Phone', value: '400-123-4567' },
          hours: { title: 'Hours', value: 'Mon-Fri 9:00-18:00' },
          address: { title: 'Address', value: 'No. xxx, xxx Road, Chaoyang District, Beijing' }
        }
      }
    ],
    footer: {
      copyright: '© 2025 FinleyBook. All rights reserved.',
      links: {
        terms: 'Terms of Service',
        about: '',
        blog: ''
      }
    }
  }
}

export default function Privacy() {
  const { language } = useLanguage()
  const t = translations[language]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8 md:p-12">
          <header className="mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{t.title}</h1>
            <p className="text-lg text-gray-600 mb-4">
              {t.lastUpdated}
            </p>
            <p className="text-gray-600 leading-relaxed">
              {t.intro}
            </p>
          </header>

          <div className="prose max-w-none">
            {t.sections.map((section, index) => (
              <section key={index} className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-900 mb-6">{section.title}</h2>

                {section.content && <p className="mb-4">{section.content}</p>}

                {section.subsections && section.subsections.map((sub, subIndex) => (
                  <div key={subIndex} className="mb-6">
                    <h3 className="text-xl font-medium text-gray-900 mb-4">{sub.title}</h3>
                    {sub.content && <p className="mb-4">{sub.content}</p>}
                    {sub.items && (
                      <ul className="list-disc pl-6 space-y-2">
                        {sub.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                ))}

                {section.items && (
                  <ul className="list-disc pl-6 space-y-2 mb-4">
                    {section.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.extraContent && <p className="mt-4 mb-4">{section.extraContent}</p>}

                {section.extraItems && (
                  <ul className="list-disc pl-6 space-y-2">
                    {section.extraItems.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                )}

                {section.contactInfo && (
                  <div className="bg-gray-50 rounded-lg p-6 mt-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      {Object.entries(section.contactInfo).map(([key, info]) => (
                        <div key={key} className={key === 'address' ? 'md:col-span-2' : ''}>
                          <h4 className="font-semibold text-gray-900 mb-2">{info.title}</h4>
                          <p className="text-gray-600">{info.value}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </section>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="text-sm text-gray-500">
                {t.footer.copyright}
              </div>
              <div className="flex gap-4">
                <Link href="/terms" className="text-sm text-blue-600 hover:text-blue-800">
                  {t.footer.links.terms}
                </Link>
                <Link href="/" className="text-sm text-blue-600 hover:text-blue-800">
                  {language === 'en' ? 'Home' : '首页'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}