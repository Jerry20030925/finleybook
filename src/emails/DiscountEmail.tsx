import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface DiscountEmailProps {
    userFirstName?: string;
    discountCode?: string;
    unsubscribeUrl?: string;
}

export default function DiscountEmail({ userFirstName = 'there', discountCode = 'SAVE10', unsubscribeUrl }: DiscountEmailProps) {
    return (
        <EmailLayout preview="A special gift for you 🎁" unsubscribeUrl={unsubscribeUrl}>
            <Heading style={headingStyle}>Unlock Pro for less</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                You've been exploring FinleyBook for a week now. I hope you're seeing the value in tracking your wealth and earning cashback.
            </Text>

            <Text style={textStyle}>
                I want to help you take it to the next level. For the next 48 hours, you can upgrade to <strong>FinleyBook Pro</strong> with an exclusive 10% discount.
            </Text>

            <Section style={offerBoxStyle}>
                <Text style={offerLabelStyle}>Use Code:</Text>
                <Heading style={codeStyle}>{discountCode}</Heading>
                <Text style={offerNoteStyle}>Valid for 48 hours only</Text>
            </Section>

            <Text style={textStyle}>
                With Pro, you get:
            </Text>

            <Section style={listStyle}>
                <Text style={listItemStyle}>✅ <strong>2x Cashback Rates</strong></Text>
                <Text style={listItemStyle}>✅ <strong>Unlimited AI Price Checks</strong></Text>
                <Text style={listItemStyle}>✅ <strong>Priority Support</strong></Text>
            </Section>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/upgrade" style={buttonStyle}>
                    Claim 10% Off Pro
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                Invest in yourself,<br />
                Jerry
            </Text>
        </EmailLayout>
    );
}

const headingStyle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111',
    textAlign: 'center' as const,
    marginBottom: '24px',
};

const textStyle = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px',
};

const offerBoxStyle = {
    backgroundColor: '#fff7ed', // Orange/Amber tint
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #fed7aa',
    textAlign: 'center' as const,
};

const offerLabelStyle = {
    fontSize: '14px',
    color: '#9a3412',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
    marginBottom: '8px',
};

const codeStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#c2410c',
    margin: '0 0 8px',
    letterSpacing: '2px',
};

const offerNoteStyle = {
    fontSize: '14px',
    color: '#9a3412',
    margin: '0',
};

const listStyle = {
    paddingLeft: '20px',
    marginBottom: '24px',
};

const listItemStyle = {
    fontSize: '16px',
    color: '#4b5563',
    marginBottom: '8px',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
};

const buttonStyle = {
    backgroundColor: '#ea580c', // Orange 600
    color: '#ffffff',
    padding: '14px 28px',
    borderRadius: '50px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    boxShadow: '0 4px 6px rgba(234, 88, 12, 0.25)',
};

const footerTextStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '40px',
};
