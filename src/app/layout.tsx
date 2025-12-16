
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
import { GlobalModalProvider } from '@/components/GlobalModalProvider'
import GlobalTransactionWrapper from '@/components/GlobalTransactionWrapper'
import SmartNotificationManager from '@/components/SmartNotificationManager'
import AIChatInput from '@/components/AIChatInput'
import NoSSR from '@/components/NoSSR'
import Navigation from '@/components/Navigation'
import BottomNavigation from '@/components/BottomNavigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'FinleyBook | AI Wealth Management & Cashback Rewards',
    template: '%s | FinleyBook - Smart Finance',
  },
  description: 'Maximize your wealth with FinleyBook. The #1 AI-powered personal finance tracker offering automated expense insights, net worth tracking, and exclusive cashback rewards in Australia and globally.',
  keywords: [
    'Wealth Management',
    'AI Finance',
    'Cashback Australia',
    'Best Expense Tracker',
    'Net Worth Calculator',
    'Financial Independence',
    'Money Management App',
    'Personal Finance Dashboard',
    '财富管理',
    '澳洲理财',
    '智能记账',
    'Passive Income'
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
  },
  verification: {
    google: 'verification_token', // TODO: User to provide Google Site Verification Token from Search Console
  },
  openGraph: {
    type: 'website',
    locale: 'en_AU',
    url: 'https://finleybook.com',
    title: 'FinleyBook | Intelligent Wealth Management & Cashback Rewards',
    description: 'Elevate your financial game. FinleyBook combines advanced AI analytics with automated wealth tracking and premium rewards discovery. Smart finance for the modern era.',
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
    title: 'FinleyBook - AI Wealth & Premium Rewards',
    description: 'Track Net Worth. Optimize Spending. Maximize Rewards. The intelligent finance platform for wealth builders.',
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
        <LanguageProvider>
          <ErrorBoundary>
            <AuthProvider>
              <NotificationProvider>
                <CurrencyProvider>
                  <SubscriptionProvider>
                    <GlobalModalProvider>
                      <SmartNotificationManager />
                      <GlobalTransactionWrapper />
                      <NoSSR>
                        <Navigation />
                        <div className="pb-24 md:pb-0"> {/* Increased padding to 6rem (96px) for safe bottom nav */}
                          {children}
                        </div>
                        <BottomNavigation />
                        <Toaster position="top-right" />
                      </NoSSR>
                    </GlobalModalProvider>
                  </SubscriptionProvider>
                </CurrencyProvider>
              </NotificationProvider>
            </AuthProvider>
          </ErrorBoundary>
        </LanguageProvider>
        <Script
          id="skimlinks-script"
          strategy="lazyOnload"
          src="https://s.skimresources.com/js/295600X1782999.skimlinks.js"
        />
      </body>
    </html>
  )
}