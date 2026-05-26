
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AppProviders } from '@/components/AppProviders'
import StructuredData from '@/components/StructuredData'
import AppChrome from '@/components/AppChrome'
import PageTransitionWrapper from '@/components/PageTransitionWrapper'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FinleyBook | Professional AI Wealth Intelligence',
    template: '%s | FinleyBook',
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'FinleyBook',
  },
  description: 'FinleyBook is a professional AI wealth intelligence platform combining automated net worth tracking, smart expense analytics, proactive budgeting, and decision-grade monthly reporting for households and professionals in Australia.',
  keywords: [
    'Wealth Management Australia',
    'AI Finance Assistant Sydney',
    'Best Expense Tracker App Australia',
    'Net Worth Tracker ASX',
    'Financial Independence App Australia',
    'Money Management Tool',
    'Personal Finance Dashboard',
    'Family Budget Planner',
    'Passive Income Ideas Australia',
    'Automated Net Worth Tracker Australia',
    'AI Expense Manager Sydney',
    'Wealth Building Tools for Australians',
    '财富管理',
    '澳洲理财',
    '智能记账',
    'Sydney Finance AI',
    'ASX Stock Portfolio Tracker'
  ],
  authors: [{ name: 'FinleyBook Team' }],
  creator: 'FinleyBook',
  publisher: 'FinleyBook',
  category: 'finance',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finleybook.com'),
  alternates: {
    canonical: '/',
    languages: {
      'en-AU': 'https://finleybook.com',
      'zh-CN': 'https://finleybook.com',
    },
  },
  verification: {
    google: 'verification_token', // TODO: Replace with real token from Google Search Console → Settings → Ownership Verification
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://finleybook.com',
    title: 'FinleyBook | Professional AI Wealth Intelligence',
    description: 'Track wealth, improve budgeting decisions, and run professional reporting workflows with AI support.',
    siteName: 'FinleyBook',
    images: [
      {
        url: 'https://finleybook.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinleyBook AI Wealth Dashboard',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@finleybook',
    creator: '@finleybook',
    title: 'FinleyBook | Professional AI Wealth Intelligence',
    description: 'Track net worth, manage spending with confidence, and generate professional financial reports.',
    images: ['https://finleybook.com/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png' },
    ],
    apple: [
      { url: '/icon.png', type: 'image/png' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* @ts-ignore */}
        <meta name="impact-site-verification" value="2b7d56d3-1c4d-459c-8fb2-9774dcc971e3" />
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <StructuredData type="software" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <AppProviders>
          <AppChrome />
          <PageTransitionWrapper>
            {children}
          </PageTransitionWrapper>
        </AppProviders>
        <Script
          id="skimlinks-script"
          strategy="lazyOnload"
          src="https://s.skimresources.com/js/295600X1782999.skimlinks.js"
        />
      </body>
    </html >
  )
}
