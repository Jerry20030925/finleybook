import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface VerifyEmailProps {
    userFirstName?: string;
    verificationCode?: string;
    verificationLink?: string;
}

export default function VerifyEmail({
    userFirstName = 'there',
    verificationCode = '123456',
    verificationLink
}: VerifyEmailProps) {
    const safeLink = verificationLink || 'https://finleybook.com/verify';
    return (
        <EmailLayout preview="Verify your email address">
            <Heading style={headingStyle}>Verify your email</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                Thanks for joining FinleyBook! To finish setting up your account, please verify your email address.
            </Text>

            <Section style={codeBoxStyle}>
                <Text style={codeLabelStyle}>Your Verification Code:</Text>
                <Heading style={codeStyle}>{verificationCode}</Heading>
            </Section>

            <Section style={ctaSectionStyle}>
                <Button href={safeLink} style={buttonStyle}>
                    Verify Email Address
                </Button>
            </Section>

            <Text style={textStyle}>
                If you didn't create an account, you can safely ignore this email.
            </Text>

            <Text style={footerTextStyle}>
                Stay secure,<br />
                The FinleyBook Team
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

const codeBoxStyle = {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    textAlign: 'center' as const,
    border: '1px solid #e5e7eb',
};

const codeLabelStyle = {
    fontSize: '14px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
    marginBottom: '8px',
};

const codeStyle = {
    fontSize: '32px',
    fontWeight: '900',
    color: '#111',
    margin: '0',
    letterSpacing: '4px',
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
