import { Metadata } from 'next'
import { redirect } from 'next/navigation'

export const metadata: Metadata = {
    title: 'FinleyBook AI Wealth Intelligence',
    description: 'FinleyBook provides AI-powered wealth insights, reporting, and proactive financial planning tools.',
    openGraph: {
        title: 'FinleyBook AI Wealth Intelligence',
        description: 'Professional wealth insights and reporting powered by FinleyBook AI.',
        url: 'https://finleybook.com/features/wealth-tracker',
        type: 'website',
    },
    alternates: {
        canonical: 'https://finleybook.com/features/wealth-tracker',
        languages: {
            'en-AU': 'https://finleybook.com/features/wealth-tracker',
        },
    },
    robots: {
        index: false,
        follow: false,
    },
}

export default function CashbackRewardsPage() {
    redirect('/features/wealth-tracker')
}
