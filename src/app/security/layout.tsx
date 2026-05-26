import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Security — Bank-Grade Protection | FinleyBook',
    description: 'FinleyBook uses AES-256 encryption, TLS 1.3, and SOC 2 Type II compliant infrastructure to protect your financial data. Your privacy comes first.',
    alternates: {
        canonical: 'https://finleybook.com/security',
    },
    openGraph: {
        title: 'Security | FinleyBook',
        description: 'Bank-grade 256-bit encryption, SOC 2 compliance, and a privacy-first approach — see how FinleyBook keeps your data safe.',
        url: 'https://finleybook.com/security',
        type: 'website',
    },
}

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
