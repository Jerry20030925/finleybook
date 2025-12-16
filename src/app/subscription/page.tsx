import SubscriptionPage from '@/components/SubscriptionPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - FinleyBook | Invest in Your Financial Future',
  description: 'Pro features for serious wealth building. automated net worth tracking, AI investment analysis, and premium cashback rewards.',
}

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionPage />
    </div>
  )
}