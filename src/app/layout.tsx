
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { NotificationProvider } from '@/components/NotificationProvider'
import { SubscriptionProvider } from '@/components/SubscriptionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import StructuredData from '@/components/StructuredData'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'
import SmartNotificationManager from '@/components/SmartNotificationManager'
import AIChatInput from '@/components/AIChatInput'
import NoSSR from '@/components/NoSSR'
import Navigation from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinleyBook - AI Wealth Tracker & Cashback Glitch Finder',
  description: 'The #1 AI Money App. Track net worth, find 90% off price glitches, and earn double cashback on daily shopping. Join the AI wealth revolution today.',
  keywords: 'Cashback App, Price Glitch Finder, AI Finance Tracker, Wealth Management, Bank Bounties, Money Saving App, FinleyBook, 现金回扣, 省钱神器, 澳洲理财',
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
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://finleybook.com',
    title: 'FinleyBook - Earn Cashback & Track Wealth with AI',
    description: 'Stop overpaying. FinleyBook finds hidden price glitches, bank bounties, and cashback rewards automatically. The smartest way to build wealth in 2025.',
    siteName: 'FinleyBook',
    images: [
      {
        url: 'https://finleybook.com/og-image.png',
        width: 1200,
        height: 630,
        alt: 'FinleyBook AI Wealth & Cashback',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinleyBook - AI Wealth & Cashback App',
    description: 'Find Price Glitches. Earn Cashback. Track Net Worth. The all-in-one AI finance superapp.',
    images: ['https://finleybook.com/og-image.png'],
    creator: '@finleybook',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
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
      <body className={inter.className}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <SmartNotificationManager />
                <CurrencyProvider>
                  <SubscriptionProvider>
                    <NoSSR>
                      <AIChatInput />
                      <Navigation />
                      {children}
                      <Toaster position="top-right" />
                    </NoSSR>
                  </SubscriptionProvider>
                </CurrencyProvider>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
        <Script
          id="skimlinks-script"
          strategy="lazyOnload"
          src="https://s.skimresources.com/js/295600X1782999.skimlinks.js"
        />
      </body>
    </html>
  )
}