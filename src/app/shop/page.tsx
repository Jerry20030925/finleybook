import { redirect } from 'next/navigation'
import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'FinleyBook Insights | Reports & Planning',
    description: 'Explore FinleyBook intelligence reports, cash flow planning, and AI wealth insights.',
    alternates: {
        canonical: 'https://finleybook.com/reports',
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default function ShopPage() {
    redirect('/reports')
}
