import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '博客 - FinleyBook 财务管理知识分享',
  description: 'FinleyBook 博客提供最新的财务管理技巧、投资策略、理财知识和行业洞察，帮助您更好地管理个人财务。',
  keywords: '财务管理, 理财知识, 投资策略, 预算规划, 财务技巧, 个人理财博客',
  openGraph: {
    title: '博客 - FinleyBook 财务管理知识分享',
    description: '获取最新的财务管理技巧和投资策略，提升您的理财技能',
    type: 'website',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: '/blog'
  }
}

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}