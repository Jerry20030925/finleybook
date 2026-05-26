import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy — How FinleyBook Protects Your Data',
    description: 'Learn how FinleyBook collects, uses, and protects your personal and financial data. We use bank-grade encryption and never sell your information.',
    alternates: {
        canonical: 'https://finleybook.com/privacy',
    },
    openGraph: {
        title: 'Privacy Policy | FinleyBook',
        description: 'Your data privacy is our priority. Read how FinleyBook safeguards your financial information with enterprise-grade security.',
        url: 'https://finleybook.com/privacy',
        type: 'website',
    },
}

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>
}
