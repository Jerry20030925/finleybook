import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'My Wealth Wallet | FinleyBook',
    description: 'Manage your cashback earnings, view transaction history, and withdraw funds.',
    robots: {
        index: false,
        follow: false,
    }
}

export default function WalletLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
