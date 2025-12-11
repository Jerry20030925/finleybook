import HomePage from '@/components/HomePage'

export const dynamic = 'force-static'

export const metadata = {
  title: 'FinleyBook - AI Wealth Tracker & Cashback App',
  description: 'The #1 AI Money App. Track net worth, find 90% off price glitches, and earn double cashback on daily shopping. Join the AI wealth revolution today.',
  alternates: {
    canonical: 'https://finleybook.com',
  },
}

import StructuredData from '@/components/StructuredData'

export default function Home() {
  return (
    <>
      <StructuredData type="software" />
      <StructuredData type="organization" />
      <HomePage />
    </>
  )
}