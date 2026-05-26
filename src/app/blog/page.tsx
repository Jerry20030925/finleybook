import { Metadata } from 'next'
import BlogClient from './BlogClient'

export const metadata: Metadata = {
  title: 'Blog | AI Finance Operations & Wealth Mastery',
  description: 'Master your money with FinleyBook. Insights on AI-driven budgeting, disciplined financial routines, and practical wealth operations.',
  openGraph: {
    title: 'FinleyBook Blog | AI Wealth Operations Insights',
    description: 'Expert advice on combining AI with disciplined financial execution and long-term growth.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://finleybook.com/blog',
  }
}

export default function Blog() {
  return <BlogClient />
}
