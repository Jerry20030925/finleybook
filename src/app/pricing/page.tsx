import { Metadata } from 'next'
import PricingClient from './PricingClient'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
    title: 'Pricing - Free & Pro Wealth Tracking Plans | FinleyBook',
    description: 'Choose the right plan for your financial journey. Upgrade to Pro for advanced AI forecasting, premium reports, and unlimited exports.',
    openGraph: {
        title: 'Simple, Transparent Pricing | FinleyBook',
        description: 'Start for free, upgrade as you grow. No hidden fees.',
    },
    alternates: {
        canonical: 'https://finleybook.com/pricing',
    }
}

export default function PricingPage() {
    return (
        <>
            <StructuredData
                type="product"
                data={{
                    name: 'FinleyBook Pro Subscription',
                    description: 'Premium wealth tracking with advanced AI insights and professional reports.',
                    id: 'pro-plan',
                    price: '4.99',
                    image: 'https://finleybook.com/og-image.png',
                    merchant: 'FinleyBook'
                }}
            />
            <PricingClient />
        </>
    )
}
