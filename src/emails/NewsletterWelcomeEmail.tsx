import { Text, Link, Section, Button } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface NewsletterWelcomeEmailProps {
    userEmail?: string;
}

export default function NewsletterWelcomeEmail({ userEmail }: NewsletterWelcomeEmailProps) {
    return (
        <EmailLayout preview="Welcome to the FinleyBook Community!">
            <Text style={headerTextStyle}>
                Welcome to the inner circle! 🌟
            </Text>

            <Text style={textStyle}>
                Thanks for subscribing to the FinleyBook newsletter. You've just joined a global community of smart money managers.
            </Text>

            <Text style={textStyle}>
                By subscribing, you've unlocked:
            </Text>

            <Section style={listContainer}>
                <Text style={listItem}>🚀 <strong>First access</strong> to new features (before the public).</Text>
                <Text style={listItem}>💡 <strong>Smart money tips</strong> to grow your wealth.</Text>
                <Text style={listItem}>🎁 <strong>Exclusive rewards</strong> and cashback boosts.</Text>
            </Section>

            <Text style={textStyle}>
                We promise to keep it valuable. No spam, ever.
            </Text>

            <Section style={buttonContainer}>
                <Button href="https://finleybook.com/dashboard" style={buttonStyle}>
                    Go to Your Dashboard
                </Button>
            </Section>

            <Text style={textStyle}>
                Talk soon,<br />
                The FinleyBook Team
            </Text>
        </EmailLayout>
    );
}

const headerTextStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const textStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#374151',
    marginBottom: '20px',
};

const listContainer = {
    padding: '0 12px',
    marginBottom: '24px',
};

const listItem = {
    fontSize: '15px',
    lineHeight: '1.6',
    color: '#4B5563',
    marginBottom: '12px',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const buttonStyle = {
    backgroundColor: '#4F46E5',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
    width: '100%',
    maxWidth: '200px',
};
