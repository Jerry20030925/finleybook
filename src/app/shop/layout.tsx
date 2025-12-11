import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Shop & Earn Cashback | FinleyBook',
    description: 'Shop at your favorite stores like Amazon and eBay and earn instant cashback. No points, just cash. The smartest way to shop online.',
    keywords: ['Cashback', 'Online Shopping', 'Amazon Rewards', 'eBay Cashback', 'Shopping Rebates', 'FinleyBook Shop'],
    alternates: {
        canonical: '/shop',
    },
    openGraph: {
        title: 'Shop & Earn Real Cash - FinleyBook',
        description: 'Get up to 5% cashback on Amazon, eBay, and more. No points, strict cash. Join the revolution.',
        url: 'https://finleybook.com/shop',
    }
}

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
