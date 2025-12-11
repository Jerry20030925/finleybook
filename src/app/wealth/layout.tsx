import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Wealth Vault | Earn Cashback & Find Glitch Deals',
    description: 'Shop at over 50+ merchants and earn up to 50% cashback. Find active price glitches, bank bounties, and exclusive tech deals.',
    alternates: {
        canonical: '/wealth',
    },
}

export default function WealthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
