import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '关于我们 - FinleyBook 智能财务管理平台',
  description: 'FinleyBook 致力于为个人和家庭提供智能、安全、易用的财务管理解决方案。我们的使命是让每个人都能轻松掌控自己的财务未来。',
  keywords: '财务管理, 个人理财, 预算规划, 投资跟踪, 财务分析, 智能记账',
  openGraph: {
    title: '关于我们 - FinleyBook 智能财务管理平台',
    description: 'FinleyBook 致力于为个人和家庭提供智能、安全、易用的财务管理解决方案',
    type: 'website',
    locale: 'zh_CN',
  },
  alternates: {
    canonical: '/about'
  }
}

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}