
import { Metadata } from 'next'
import AboutContent from '@/components/AboutContent'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
  title: 'About FinleyBook - The AI Manifestation Engine',
  description: 'FinleyBook is an AI-powered platform transforming vision boards into actionable daily missions. Learn about our mission to combine the Law of Attraction with AI technology.',
  alternates: {
    canonical: 'https://finleybook.com/about',
    languages: {
      'en-AU': 'https://finleybook.com/about',
      'zh-CN': 'https://finleybook.com/zh/about',
    },
  },
  openGraph: {
    title: 'FinleyBook - Turn Dreams into Daily Missions',
    description: 'Meet the team building the world\'s first AI Manifestation Engine.',
    url: 'https://finleybook.com/about',
    siteName: 'FinleyBook',
    images: [
      {
        url: 'https://finleybook.com/og-about.png', // Assuming this exists or falls back to default
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