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
  contactInfo?: Record<string, { title: string; value: string; content?: React.ReactNode }>
}

const translations: Record<string, {
  title: string
  lastUpdated: string
  intro: string
  sections: Section[]
  footer: {
    copyright: string
    links: {
      privacy: string
      about: string
      blog: string
    }
  }
}> = {
  zh: {
    title: '服务条款',
    lastUpdated: '最后更新时间：2024年11月25日',
    intro: '欢迎使用FinleyBook！这些服务条款（以下简称"条款"）规定了您使用我们平台服务的权利和义务。请您仔细阅读本条款，如果您不同意本条款的任何内容，请不要使用我们的服务。',
    sections: [
      {
        title: '1. 服务说明',
        subsections: [
          {
            title: '1.1 服务内容',
            content: 'FinleyBook为您提供以下服务：',
            items: [
              '个人财务数据记录和管理',
              '预算制定和跟踪工具',
              '财务分析和报表生成',
              '投资组合管理功能',
              '财务目标设定和监控',
              'AI驱动的财务洞察和建议',
              '安全的数据存储和备份服务'
            ]
          },
          {
            title: '1.2 服务可用性',
            content: '我们努力确保服务的连续可用性，但不保证服务100%无中断。我们可能因维护、升级或其他技术原因临时暂停服务，我们将尽量提前通知您。'
          }
        ]
      },
      {
        title: '2. 账户注册与管理',
        subsections: [
          {
            title: '2.1 注册要求',
            items: [
              '您必须年满18周岁',
              '提供准确、完整和最新的注册信息',
              '选择安全的密码并保护账户安全',
              '一人只能注册一个账户（除非获得我们的明确许可）',
              '不得冒用他人身份注册'
            ]
          },
          {
            title: '2.2 账户安全',
            items: [
              '您有责任保护您的登录凭据安全',
              '不得与他人共享您的账户信息',
              '如发现账户异常活动，请立即联系我们',
              '您对账户下的所有活动负责'
            ]
          }
        ]
      },
      {
        title: '3. 用户行为规范',
        subsections: [
          {
            title: '3.1 禁止行为',
            content: '在使用我们的服务时，您不得：',
            items: [
              '上传虚假、误导性或非法的信息',
              '尝试未经授权访问我们的系统或其他用户的账户',
              '使用自动化工具（如机器人、爬虫）访问我们的服务',
              '干扰或破坏我们服务的正常运行',
              '侵犯他人的知识产权或隐私权',
              '进行任何非法活动或协助他人进行非法活动',
              '发送垃圾信息或进行恶意营销'
            ]
          },
          {
            title: '3.2 数据准确性',
            content: '您承诺提供的财务数据真实、准确、完整。虚假数据可能导致错误的分析结果，影响您的财务决策。'
          }
        ]
      },
      {
        title: '4. 费用与付款',
        subsections: [
          {
            title: '4.1 免费服务',
            content: '我们提供基本的免费服务，包括：',
            items: [
              '基础的财务记录功能',
              '简单的预算管理',
              '基本的报表生成',
              '有限的存储空间'
            ]
          },
          {
            title: '4.2 付费服务',
            content: '我们的付费计划包括额外功能：',
            items: [
              '高级分析和AI建议',
              '无限制的数据存储',
              '投资组合管理',
              '优先客户支持',
              '高级报表和导出功能'
            ]
          },
          {
            title: '4.3 付款条款',
            items: [
              '付费服务按月或按年计费',
              '费用将在服务期开始时收取',
              '所有费用不可退还，除非法律另有规定',
              '我们保留调整价格的权利，但会提前30天通知'
            ]
          }
        ]
      },
      {
        title: '5. 知识产权',
        subsections: [
          {
            title: '5.1 我们的权利',
            content: 'FinleyBook平台、软件、技术、商标、版权等知识产权归我们所有。您获得的仅是使用服务的许可，而非任何知识产权的转让。'
          },
          {
            title: '5.2 用户内容',
            content: '您上传到我们平台的数据和内容仍归您所有。您授予我们为提供服务所必需的使用、处理和存储这些内容的权利。'
          },
          {
            title: '5.3 反馈和建议',
            content: '您向我们提供的任何反馈、建议或想法，我们可以自由使用，无需向您支付任何费用或承担任何义务。'
          }
        ]
      },
      {
        title: '6. 免责声明',
        subsections: [
          {
            title: '6.1 服务"按现状"提供',
            content: '我们的服务按"现状"提供，不提供任何明示或暗示的保证。我们不保证服务完全无错误、无中断或满足您的特定需求。'
          },
          {
            title: '6.2 财务建议免责',
            content: '我们提供的分析、建议和洞察仅供参考，不构成专业的财务建议。您应该在做出任何财务决策前咨询专业的财务顾问。'
          },
          {
            title: '6.3 数据丢失风险',
            content: '虽然我们采取了合理的数据保护措施，但我们不能保证您的数据不会丢失。建议您定期备份重要数据。'
          }
        ]
      },
      {
        title: '7. 责任限制',
        content: '在法律允许的最大范围内：',
        items: [
          '我们的总责任不超过您在过去12个月内向我们支付的费用',
          '我们不承担任何间接、特殊、偶然或后果性损失',
          '我们不对因使用或无法使用服务而造成的任何损失承担责任',
          '我们不对第三方行为或内容承担责任'
        ]
      },
      {
        title: '8. 服务终止',
        subsections: [
          {
            title: '8.1 您的终止权利',
            items: [
              '您可以随时停止使用我们的服务',
              '您可以在账户设置中删除您的账户',
              '付费订阅将在当前计费周期结束后自动终止'
            ]
          },
          {
            title: '8.2 我们的终止权利',
            content: '在以下情况下，我们可能暂停或终止您的账户：',
            items: [
              '违反本服务条款',
              '进行非法活动',
              '长期不活跃的账户',
              '未按时支付费用',
              '存在安全风险'
            ]
          }
        ]
      },
      {
        title: '9. 争议解决',
        subsections: [
          {
            title: '9.1 协商解决',
            content: '如果发生争议，我们鼓励双方首先通过友好协商解决。您可以通过我们的客服渠道联系我们。'
          },
          {
            title: '9.2 适用法律',
            content: '本条款受中华人民共和国法律管辖。任何争议将提交至北京市朝阳区人民法院解决。'
          }
        ]
      },
      {
        title: '10. 条款修改',
        content: '我们可能会不时更新这些服务条款。重大变更将通过以下方式通知您：',
        items: [
          '在网站上发布更新通知',
          '通过电子邮件通知',
          '在应用程序中显示提醒'
        ]
      },
      {
        title: '11. 联系信息',
        content: '如果您对本服务条款有任何疑问，请通过以下方式联系我们：',
        contactInfo: {
          email: { title: '客服邮箱', value: 'support@finleybook.com' },
          legal: { title: '法务邮箱', value: 'legal@finleybook.com' },
          phone: { title: '客服电话', value: '400-123-4567' },
          hours: { title: '工作时间', value: '周一至周五 9:00-18:00' },
          address: { title: '公司地址', value: '北京市朝阳区xxx路xxx号 FinleyBook 科技有限公司' }
        }
      },
      {
        title: '12. 其他条款',
        subsections: [
          {
            title: '12.1 完整协议',
            content: '本服务条款与我们的隐私政策共同构成您与我们之间的完整协议，取代之前的所有口头或书面协议。'
          },
          {
            title: '12.2 可分割性',
            content: '如果本条款的任何部分被认定为无效或无法执行，其余部分仍然有效并可执行。'
          },
          {
            title: '12.3 不弃权',
            content: '我们未执行本条款的任何条款不构成对该条款的弃权。'
          }
        ]
      }
    ],
    footer: {
      copyright: '© 2025 FinleyBook. 保留所有权利。',
      links: {
        privacy: '隐私政策',
        about: '关于我们',
        blog: '博客'
      }
    }
  },
  en: {
    title: 'Terms of Service',
    lastUpdated: 'Last Updated: November 25, 2025',
    intro: 'Welcome to FinleyBook! These Terms of Service ("Terms") govern your use of our platform and services. Please read these Terms carefully. If you do not agree with any part of these Terms, please do not use our services.',
    sections: [
      {
        title: '1. Acceptance of Terms',
        content: 'By accessing or using FinleyBook\'s services, you agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our services.',
        subsections: [
          {
            title: '1.1 Service Description',
            content: 'FinleyBook provides a personal financial management platform, including but not limited to:',
            items: [
              'Financial data recording and categorization',
              'Budgeting and spending analysis',
              'Financial report generation',
              'Investment portfolio tracking',
              'Secure data storage and backup services'
            ]
          },
          {
            title: '1.2 Service Availability',
            content: 'We strive to ensure continuous availability of services but do not guarantee 100% uninterrupted service. We may temporarily suspend services for maintenance, upgrades, or other technical reasons, and will try to notify you in advance.'
          }
        ]
      },
      {
        title: '2. Account Registration and Management',
        subsections: [
          {
            title: '2.1 Registration Requirements',
            items: [
              'You must be at least 18 years old',
              'Provide accurate, complete, and up-to-date registration information',
              'Choose a secure password and protect account security',
              'Only one account per person (unless explicitly permitted by us)',
              'Do not register using another person\'s identity'
            ]
          },
          {
            title: '2.2 Account Security',
            items: [
              'You are responsible for protecting your login credentials',
              'Do not share your account information with others',
              'Contact us immediately if you notice any suspicious account activity',
              'You are responsible for all activities under your account'
            ]
          }
        ]
      },
      {
        title: '3. User Conduct',
        subsections: [
          {
            title: '3.1 Prohibited Conduct',
            content: 'When using our services, you must not:',
            items: [
              'Upload false, misleading, or illegal information',
              'Attempt unauthorized access to our systems or other users\' accounts',
              'Use automated tools (e.g., bots, crawlers) to access our services',
              'Interfere with or disrupt the normal operation of our services',
              'Infringe upon others\' intellectual property or privacy rights',
              'Engage in any illegal activity or assist others in doing so',
              'Send spam or engage in malicious marketing'
            ]
          },
          {
            title: '3.2 Data Accuracy',
            content: 'You promise that the financial data provided is true, accurate, and complete. False data may lead to incorrect analysis results and affect your financial decisions.'
          }
        ]
      },
      {
        title: '4. Fees and Payments',
        subsections: [
          {
            title: '4.1 Free Services',
            content: 'We provide basic free services, including:',
            items: [
              'Basic financial recording features',
              'Simple budget management',
              'Basic report generation',
              'Limited storage space'
            ]
          },
          {
            title: '4.2 Paid Services',
            content: 'Our paid plans include additional features:',
            items: [
              'Advanced analysis and AI suggestions',
              'Unlimited data storage',
              'Portfolio management',
              'Priority customer support',
              'Advanced reporting and export features'
            ]
          },
          {
            title: '4.3 Payment Terms',
            items: [
              'Paid services are billed monthly or annually',
              'Fees are charged at the beginning of the service period',
              'All fees are non-refundable unless required by law',
              'We reserve the right to adjust prices but will notify you 30 days in advance'
            ]
          }
        ]
      },
      {
        title: '5. Intellectual Property',
        subsections: [
          {
            title: '5.1 Our Rights',
            content: 'FinleyBook platform, software, technology, trademarks, copyrights, etc., are owned by us. You are granted only a license to use the services, not a transfer of any intellectual property rights.'
          },
          {
            title: '5.2 User Content',
            content: 'Data and content you upload to our platform remain yours. You grant us the right to use, process, and store such content as necessary to provide the services.'
          },
          {
            title: '5.3 Feedback and Suggestions',
            content: 'Any feedback, suggestions, or ideas you provide to us may be used freely by us without any fee or obligation to you.'
          }
        ]
      },
      {
        title: '6. Disclaimer',
        subsections: [
          {
            title: '6.1 Services Provided "As Is"',
            content: 'Our services are provided "as is" without any express or implied warranties. We do not guarantee that the services will be completely error-free, uninterrupted, or meet your specific needs.'
          },
          {
            title: '6.2 Financial Advice Disclaimer',
            content: 'The analysis, suggestions, and insights we provide are for reference only and do not constitute professional financial advice. You should consult a professional financial advisor before making any financial decisions.'
          },
          {
            title: '6.3 Data Loss Risk',
            content: 'Although we take reasonable data protection measures, we cannot guarantee that your data will not be lost. We recommend that you regularly backup important data.'
          }
        ]
      },
      {
        title: '7. Limitation of Liability',
        content: 'To the maximum extent permitted by law:',
        items: [
          'Our total liability shall not exceed the fees you paid to us in the past 12 months',
          'We are not liable for any indirect, special, incidental, or consequential damages',
          'We are not liable for any damages caused by the use or inability to use the services',
          'We are not liable for third-party actions or content'
        ]
      },
      {
        title: '8. Termination of Service',
        subsections: [
          {
            title: '8.1 Your Termination Rights',
            items: [
              'You can stop using our services at any time',
              'You can delete your account in account settings',
              'Paid subscriptions will automatically terminate at the end of the current billing cycle'
            ]
          },
          {
            title: '8.2 Our Termination Rights',
            content: 'We may suspend or terminate your account in the following circumstances:',
            items: [
              'Violation of these Terms of Service',
              'Engaging in illegal activities',
              'Long-term inactive accounts',
              'Failure to pay fees on time',
              'Existence of security risks'
            ]
          }
        ]
      },
      {
        title: '9. Dispute Resolution',
        subsections: [
          {
            title: '9.1 Negotiation',
            content: 'If a dispute arises, we encourage both parties to first resolve it through friendly negotiation. You can contact us through our customer service channels.'
          },
          {
            title: '9.2 Governing Law',
            content: 'These Terms are governed by the laws of the People\'s Republic of China. Any dispute shall be submitted to the People\'s Court of Chaoyang District, Beijing for resolution.'
          }
        ]
      },
      {
        title: '10. Terms Modification',
        content: 'We may update these Terms of Service from time to time. Significant changes will be notified to you by:',
        items: [
          'Posting update notices on the website',
          'Email notifications',
          'Displaying alerts in the application'
        ]
      },
      {
        title: '11. Contact Information',
        content: 'If you have any questions regarding these Terms of Service, please contact us via:',
        contactInfo: {
          email: { title: 'Support Email', value: 'support@finleybook.com' },
          legal: { title: 'Legal Email', value: 'legal@finleybook.com' },
          phone: { title: 'Phone', value: '400-123-4567' },
          hours: { title: 'Hours', value: 'Mon-Fri 9:00-18:00' },
          address: { title: 'Address', value: 'No. xxx, xxx Road, Chaoyang District, Beijing, FinleyBook Technology Co., Ltd.' }
        }
      },
      {
        title: '12. Other Terms',
        subsections: [
          {
            title: '12.1 Entire Agreement',
            content: 'These Terms of Service together with our Privacy Policy constitute the entire agreement between you and us, superseding all prior oral or written agreements.'
          },
          {
            title: '12.2 Severability',
            content: 'If any part of these Terms is found to be invalid or unenforceable, the remaining parts shall remain valid and enforceable.'
          },
          {
            title: '12.3 No Waiver',
            content: 'Our failure to enforce any provision of these Terms does not constitute a waiver of that provision.'
          }
        ]
      }
    ],
    footer: {
      copyright: '© 2025 FinleyBook. All rights reserved.',
      links: {
        privacy: 'Privacy Policy',
        about: '',
        blog: ''
      }
    }
  }
}

export default function Terms() {
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
                <Link href="/privacy" className="text-sm text-blue-600 hover:text-blue-800">
                  {t.footer.links.privacy}
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