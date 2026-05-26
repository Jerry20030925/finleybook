import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'FinleyBook Reports Hub',
    description: 'Professional financial reports and AI-driven wealth intelligence.',
    keywords: ['FinleyBook reports', 'AI wealth intelligence', 'financial planning'],
    alternates: {
        canonical: '/reports',
    },
    openGraph: {
        title: 'FinleyBook Reports Hub',
        description: 'Professional financial reports and AI-driven wealth intelligence.',
        url: 'https://finleybook.com/reports',
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
