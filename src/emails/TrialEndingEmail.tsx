import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface TrialEndingEmailProps {
    userFirstName?: string;
    daysLeft?: number;
}

export default function TrialEndingEmail({
    userFirstName = 'there',
    daysLeft = 3
}: TrialEndingEmailProps) {
    return (
        <EmailLayout preview={`Your Pro trial ends in ${daysLeft} days`}>
            <Heading style={headingStyle}>Don't lose your Pro powers</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                Just a heads up that your FinleyBook Pro trial is ending in <strong>{daysLeft} days</strong>.
            </Text>

            <Text style={textStyle}>
                I hope you've enjoyed the 2x cashback rates and AI insights. If you do nothing, your account will automatically switch to the Free plan, and you'll lose access to:
            </Text>

            <Section style={listBoxStyle}>
                <Text style={listItemStyle}>❌ <strong>2x Cashback Boosts</strong></Text>
                <Text style={listItemStyle}>❌ <strong>AI Price Finder</strong></Text>
                <Text style={listItemStyle}>❌ <strong>Unlimited Wishlist Tracking</strong></Text>
            </Section>

            <Text style={textStyle}>
                Keep the momentum going. Subscribe now to lock in your Pro features.
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/upgrade" style={buttonStyle}>
                    Keep FinleyBook Pro
                </Button>
            </Section>

            <Text style={footerTextStyle}>
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

const listBoxStyle = {
    backgroundColor: '#fff1f2',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #fecdd3',
};

const listItemStyle = {
    fontSize: '16px',
    color: '#9f1239', // Rose 800
    marginBottom: '8px',
    display: 'block',
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
