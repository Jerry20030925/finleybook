import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface ReferralInviteEmailProps {
    inviterName?: string;
    referralLink?: string;
}

export default function ReferralInviteEmail({
    inviterName = 'Jerry',
    referralLink = 'https://finleybook.com/join?ref=jerry'
}: ReferralInviteEmailProps) {
    return (
        <EmailLayout preview={`${inviterName} invited you to FinleyBook`}>
            <Heading style={headingStyle}>{inviterName} wants you to save money</Heading>

            <Text style={textStyle}>Hi there,</Text>

            <Text style={textStyle}>
                Your friend <strong>{inviterName}</strong> has been using FinleyBook to track their wealth and earn cashback on shopping. They thought you might like it too.
            </Text>

            <Section style={quoteBoxStyle}>
                <Text style={quoteStyle}>
                    "I'm using FinleyBook to get cash back on my shopping. Use my link to get a bonus when you join!"
                </Text>
            </Section>

            <Section style={ctaSectionStyle}>
                <Button href={referralLink} style={buttonStyle}>
                    Accept Invitation
                </Button>
            </Section>

            <Text style={textStyle}>
                Join today and start building your wealth.
            </Text>

            <Text style={footerTextStyle}>
                FinleyBook Team
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

const quoteBoxStyle = {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    borderLeft: '4px solid #000',
};

const quoteStyle = {
    fontSize: '18px',
    fontStyle: 'italic',
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
