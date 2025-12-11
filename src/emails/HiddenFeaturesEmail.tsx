import { Button, Text, Heading, Section, Img } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface HiddenFeaturesEmailProps {
    userFirstName?: string;
    unsubscribeUrl?: string;
}

export default function HiddenFeaturesEmail({ userFirstName = 'there', unsubscribeUrl }: HiddenFeaturesEmailProps) {
    return (
        <EmailLayout preview="Did you find this hidden feature? 👀" unsubscribeUrl={unsubscribeUrl}>
            <Heading style={headingStyle}>The secret to saving more...</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                You've been using FinleyBook for a few days now, but I wanted to make sure you didn't miss our most powerful feature: <strong>The AI Price Finder</strong>.
            </Text>

            <Section style={featureBoxStyle}>
                <Heading as="h3" style={subHeadingStyle}>🔍 AI Price Finder</Heading>
                <Text style={textStyle}>
                    Stop manually searching for better deals. Just paste an Amazon link into the Wealth Vault, and our AI will instantly check if there's a cheaper price or a better cashback rate available.
                </Text>
            </Section>

            <Text style={textStyle}>
                It takes 5 seconds and could save you $50 on your next purchase.
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/wealth" style={buttonStyle}>
                    Try AI Price Finder
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                Happy saving,<br />
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

const subHeadingStyle = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#111',
    marginBottom: '12px',
};

const textStyle = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.6',
    marginBottom: '16px',
};

const featureBoxStyle = {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
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
