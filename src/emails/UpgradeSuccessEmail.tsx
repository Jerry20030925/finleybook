import { Text, Heading, Section, Link } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface UpgradeSuccessEmailProps {
    userFirstName?: string;
    planName?: string; // "Pro Monthly" or "Pro Yearly"
}

export default function UpgradeSuccessEmail({
    userFirstName = 'there',
    planName = 'Pro Yearly'
}: UpgradeSuccessEmailProps) {
    return (
        <EmailLayout preview="You are now a Pro member! 🚀">
            {/* Header Icon */}
            <Section style={iconSection}>
                <Text style={iconStyle}>⚡️</Text>
            </Section>

            <Heading style={titleStyle}>Welcome to Pro</Heading>

            <Text style={greetingStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                Your upgrade to <strong>{planName}</strong> was successful. You now have access to the full power of FinleyBook.
            </Text>

            {/* Features List */}
            <Section style={featureListStyle}>
                <Text style={featureItemStyle}>✅ <strong>2x Cashback Rates</strong> enabled</Text>
                <Text style={featureItemStyle}>✅ <strong>iCloud Backups</strong> active</Text>
                <Text style={featureItemStyle}>✅ <strong>AI Alternative Finder</strong> unlocked</Text>
                <Text style={featureItemStyle}>✅ <strong>Unlimited Wishlist</strong> ready</Text>
            </Section>

            <Text style={textStyle}>
                We built Pro to pay for itself. Use the AI Finder once, and you'll likely save more than the subscription cost.
            </Text>

            <Section style={ctaSectionStyle}>
                <Link href="https://finleybook.com/dashboard" style={buttonStyle}>
                    Go to Dashboard
                </Link>
            </Section>

            <Text style={footerTextStyle}>
                Thank you for supporting independent software.
            </Text>
        </EmailLayout>
    );
}

const iconSection = {
    textAlign: 'center' as const,
    marginBottom: '20px',
};

const iconStyle = {
    fontSize: '48px',
    margin: '0',
};

const titleStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center' as const,
    margin: '0 0 32px',
    letterSpacing: '-0.5px',
};

const greetingStyle = {
    fontSize: '18px',
    color: '#374151',
    marginBottom: '16px',
};

const textStyle = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '24px',
};

const featureListStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '32px',
    border: '1px solid #e5e7eb',
};

const featureItemStyle = {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '12px',
    display: 'block',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const buttonStyle = {
    backgroundColor: '#6366f1', // Indigo
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'inline-block',
    boxShadow: '0 4px 6px rgba(99, 102, 241, 0.25)',
};

const footerTextStyle = {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '0',
};
