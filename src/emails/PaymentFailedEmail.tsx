import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface PaymentFailedEmailProps {
    userFirstName?: string;
    amount?: string;
    date?: string;
}

export default function PaymentFailedEmail({
    userFirstName = 'there',
    amount = '$19.99',
    date = 'Dec 4, 2025'
}: PaymentFailedEmailProps) {
    return (
        <EmailLayout preview="Action Required: Payment Failed">
            <Heading style={headingStyle}>We couldn't process your payment</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                We attempted to charge your card for your FinleyBook Pro subscription on <strong>{date}</strong>, but the payment failed.
            </Text>

            <Text style={textStyle}>
                This usually happens because a card has expired or has insufficient funds.
            </Text>

            <Section style={amountBoxStyle}>
                <Text style={labelStyle}>Amount Due</Text>
                <Heading style={amountStyle}>{amount}</Heading>
            </Section>

            <Text style={textStyle}>
                To ensure you don't lose access to Pro features like 2x Cashback and AI Price Finder, please update your payment method.
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/settings/billing" style={buttonStyle}>
                    Update Payment Method
                </Button>
            </Section>

            <Text style={textStyle}>
                We'll try again in a few days.
            </Text>

            <Text style={footerTextStyle}>
                Thanks,<br />
                The FinleyBook Team
            </Text>
        </EmailLayout>
    );
}

const headingStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#b91c1c', // Red
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const textStyle = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px',
};

const amountBoxStyle = {
    textAlign: 'center' as const,
    margin: '24px 0',
    padding: '24px',
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
};

const labelStyle = {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
    marginBottom: '8px',
};

const amountStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111',
    margin: '0',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
};

const buttonStyle = {
    backgroundColor: '#000000',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '6px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
};

const footerTextStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '40px',
};
