import SubscriptionPage from '@/components/SubscriptionPage'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Pricing - FinleyBook | Professional Wealth Intelligence',
  description: 'Upgrade to FinleyBook Pro for advanced AI analytics, professional financial reports, and unlimited exports.',
}

export default function Subscription() {
  return (
    <div className="min-h-screen bg-gray-50">
      <SubscriptionPage />
    </div>
  )
}
