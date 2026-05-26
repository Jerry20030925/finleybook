import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'FinleyBook Reports Hub',
    description: 'Professional financial reporting and AI wealth intelligence by FinleyBook.',
    alternates: {
        canonical: '/reports',
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default function WealthLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return children
}
