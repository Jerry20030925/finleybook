import { Metadata } from 'next'
import HelpCenterClient from './HelpCenterClient'
import StructuredData from '@/components/StructuredData'

export const metadata: Metadata = {
    title: 'Help Center - FinleyBook | Support & FAQs',
    description: 'Find answers about bookkeeping setup, security, reports, and subscription management. FinleyBook support is available 24/7.',
    keywords: ['FinleyBook help', 'finance app support', 'bookkeeping help', 'Australia wealth tracking support', 'Plaid banking security'],
    alternates: {
        canonical: 'https://finleybook.com/help',
    }
}

const faqs = [
    {
        question: "How do I connect my bank account?",
        answer: "You can connect your bank account securely through our 'Link Account' feature on the dashboard. We use Plaid to securely connect to over 10,000 financial institutions."
    },
    {
        question: "Is my data safe?",
        answer: "Yes, absolutely. We use bank-grade 256-bit encryption and never store your banking credentials on our servers. You can read more in our Security Center."
    },
    {
        question: "How does Finley AI guidance work?",
        answer: "Use Finley AI inside Dashboard, Profile, or Reports to get step-by-step bookkeeping and budgeting guidance. You can also confirm AI suggestions to create transactions, budgets, and goals faster."
    },
    {
        question: "How long does data synchronization take?",
        answer: "Initial synchronization can take a few minutes depending on the amount of historical data. After that, your data is refreshed automatically every 24 hours, or you can manually refresh it instantly on the Pro plan."
    },
    {
        question: "Can I export my data?",
        answer: "Yes, you can export your transaction history and reports as CSV or PDF files from the Settings menu."
    },
    {
        question: "How do I cancel my subscription?",
        answer: "You can manage or cancel your subscription at any time from the Billing section in your account settings. You will continue to have access until the end of your current billing period."
    }
]

export default function HelpCenterPage() {
    return (
        <>
            <StructuredData
                type="faq"
                data={faqs}
            />
            <HelpCenterClient faqs={faqs} />
        </>
    )
}
