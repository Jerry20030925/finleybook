
import { Metadata } from 'next'
import AboutContent from '@/components/AboutContent'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'About FinleyBook - Professional AI Wealth Intelligence (关于我们)',
  description: 'FinleyBook is an AI-powered personal finance platform helping users build wealth through disciplined bookkeeping, smart expense analytics, and decision-grade reports. 澳洲领先的AI财富管理平台。',
  keywords: ['About FinleyBook', 'FinleyBook mission', 'AI Wealth Management', 'FinleyBook Team', '关于FinleyBook', '澳洲AI记账', '智能财富管理'],
  alternates: {
    canonical: 'https://finleybook.com/about',
    languages: {
      'en-AU': 'https://finleybook.com/about',
      'zh-CN': 'https://finleybook.com/zh/about',
    },
  },
  openGraph: {
    title: 'About FinleyBook | Intelligent Wealth Management',
    description: 'Our mission is to democratize financial intelligence. Meet the team building the world\'s smartest personal finance assistant.',
    url: 'https://finleybook.com/about',
    siteName: 'FinleyBook',
    images: [
      {
        url: 'https://finleybook.com/og-about.png',
        width: 1200,
        height: 630,
        alt: 'FinleyBook Team and Mission',
      },
    ],
    locale: 'en_AU',
    type: 'website',
  },
}

export default function AboutPage() {
  return (
    <>
      <StructuredData type="organization" data={{}} />
      <AboutContent />
    </>
  )
}
