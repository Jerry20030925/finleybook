import AppEntry from '@/components/AppEntry'

export const dynamic = 'force-static'

export const metadata = {
  title: 'FinleyBook | Professional AI Wealth Intelligence Platform',
  description: 'Track net worth, manage budgets, and generate decision-grade financial reports with practical AI guidance in one secure platform.',
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
      <AppEntry />
    </>
  )
}
