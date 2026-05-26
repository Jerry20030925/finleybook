import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service — FinleyBook User Agreement',
    description: 'Read the FinleyBook Terms of Service governing your use of our AI wealth intelligence platform, including account policies, fees, and dispute resolution.',
    alternates: {
        canonical: 'https://finleybook.com/terms',
    },
    openGraph: {
        title: 'Terms of Service | FinleyBook',
        description: 'Understand your rights and responsibilities when using FinleyBook — the AI-powered wealth management platform.',
        url: 'https://finleybook.com/terms',
        type: 'website',
    },
}

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
