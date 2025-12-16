import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog - Smart Finance Tips & News | FinleyBook',
  description: 'Expert insights on wealth management, AI finance tools, and manifestation strategies. Turn your digital dreams into physical reality with FinleyBook.',
  keywords: 'Wealth Management, Financial Tips, Investment Strategy, AI Finance, Manifestation, Personal Finance Blog',
  openGraph: {
    title: 'Blog - Smart Finance Tips & News | FinleyBook',
    description: 'Expert insights on wealth management, AI finance tools, and manifestation strategies.',
    type: 'website',
    locale: 'en_AU',
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