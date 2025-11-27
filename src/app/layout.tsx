
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { NotificationProvider } from '@/components/NotificationProvider'
import { SubscriptionProvider } from '@/components/SubscriptionProvider'
import ErrorBoundary from '@/components/ErrorBoundary'
import StructuredData from '@/components/StructuredData'
import { Toaster } from 'react-hot-toast'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'FinleyBook - AI-Driven Personal Finance',
  description: 'Smart financial management, making finance simple. AI-driven personal finance platform.',
  keywords: '个人理财, 财务管理, 预算规划, 投资跟踪, 记账软件, AI理财, 财务分析, 税务管理, 理财工具, 财务规划',
  authors: [{ name: 'FinleyBook Team' }],
  creator: 'FinleyBook',
  publisher: 'FinleyBook',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://finleybook.com'),
  alternates: {
    canonical: '/',
    languages: {
      'zh-CN': '/',
      'en-US': '/en',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'zh_CN',
    url: 'https://finleybook.com',
    title: 'FinleyBook - 智能个人财务管理平台',
    description: 'AI驱动的个人理财和财务管理解决方案，让您轻松掌控财务生活',
    siteName: 'FinleyBook',
    images: [
      {
        url: 'https://finleybook.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'FinleyBook 智能财务管理平台',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FinleyBook - 智能个人财务管理平台',
    description: 'AI驱动的个人理财和财务管理解决方案',
    images: ['https://finleybook.com/twitter-image.jpg'],
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
  verification: {
    google: 'google-site-verification-code',
    yandex: 'yandex-verification-code',
    yahoo: 'yahoo-site-verification-code',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <StructuredData type="website" />
        <StructuredData type="organization" />
        <StructuredData type="software" />
      </head>
      <body className={inter.className}>
        <ErrorBoundary>
          <LanguageProvider>
            <AuthProvider>
              <NotificationProvider>
                <CurrencyProvider>
                  <SubscriptionProvider>
                    {children}
                    <Toaster position="top-right" />
                  </SubscriptionProvider>
                </CurrencyProvider>
              </NotificationProvider>
            </AuthProvider>
          </LanguageProvider>
        </ErrorBoundary>
      </body>
    </html>
  )
}