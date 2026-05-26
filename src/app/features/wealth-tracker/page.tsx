import { Metadata } from 'next'
import WealthTrackerClient from './WealthTrackerClient'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
    title: 'AI Wealth Tracker & Net Worth Calculator | FinleyBook (智能财富追踪)',
    description: 'Track your entire financial life with FinleyBook\'s AI Wealth Tracker. Visualise spending, predict cash flow, and monitor net worth in real-time. 智能财务管理与资产追踪。',
    keywords: ['AI Wealth Tracker', 'Net Worth Calculator', 'personal finance Australia', '资产追踪', '智能记账', '财务规划', 'wealth management app'],
    openGraph: {
        title: 'AI Wealth Tracker | God Mode for Your Finances',
        description: 'Stop guessing. Start tracking. The most advanced personal finance dashboard available in Australia.',
        url: 'https://finleybook.com/features/wealth-tracker',
        type: 'website',
    },
    alternates: {
        canonical: 'https://finleybook.com/features/wealth-tracker',
        languages: {
            'en-AU': 'https://finleybook.com/features/wealth-tracker',
            'zh-CN': 'https://finleybook.com/zh/features/wealth-tracker',
        },
    }
}

export default function WealthTrackerPage() {
    return (
        <>
            <StructuredData
                type="software"
                data={{
                    name: 'FinleyBook AI Wealth Tracker',
                    description: 'Automated wealth tracking and net worth calculation software.',
                    applicationCategory: 'FinanceApplication',
                    operatingSystem: 'Web'
                }}
            />
            <WealthTrackerClient />
        </>
    )
}
