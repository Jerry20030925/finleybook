import { Button, Text, Section, Heading } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface ReengagementEmailProps {
    userFirstName?: string;
    globalEarnings?: string;
}

export default function ReengagementEmail({ userFirstName = 'there', globalEarnings = '12,450' }: ReengagementEmailProps) {
    return (
        <EmailLayout preview="Amazon and The Iconic just boosted their rates.">
            <Heading style={headingStyle}>You're missing out on free money... 👀</Heading>
            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                We haven’t seen you in a while!
            </Text>

            <Text style={textStyle}>
                While you were away, our users earned a total of <strong>${globalEarnings}</strong> in cashback. I don't want you to leave money on the table.
            </Text>

            <Section style={boxStyle}>
                <Heading as="h3" style={{ ...headingStyle, fontSize: '18px', marginBottom: '16px' }}>🔥 Trending Right Now:</Heading>
                <Text style={listItemStyle}>• <strong>The Iconic:</strong> Boosted to 12% (Ends soon)</Text>
                <Text style={listItemStyle}>• <strong>Amazon AU:</strong> Up to 8% on Electronics</Text>
                <Text style={listItemStyle}>• <strong>Myer:</strong> 5% Cashback + End of Season Sale</Text>
            </Section>

            <Text style={textStyle}>
                Come take a look and claim what's yours.
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                <Button href="https://finleybook.com/wealth" style={buttonStyle}>
                    Go to Wealth Vault
                </Button>
            </Section>

            <Text style={footerStyle}>
                Hope to see you back,<br />
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
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '16px',
};

const boxStyle = {
    backgroundColor: '#fff1f2', // Light rose
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
    border: '1px solid #fecdd3',
};

const listItemStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '8px',
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

const footerStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '40px',
};
