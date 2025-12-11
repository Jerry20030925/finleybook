import { Button, Text, Section, Heading } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface CashbackActivationEmailProps {
    userFirstName?: string;
    merchant?: string;
    rate?: string;
}

export default function CashbackActivationEmail({ userFirstName = 'there', merchant = 'Merchant', rate = '0%' }: CashbackActivationEmailProps) {
    return (
        <EmailLayout preview={`Cashback activated for ${merchant}! Shop now to earn ${rate}.`}>
            <Heading style={headingStyle}>🚀 Cashback Activated!</Heading>
            <Text style={textStyle}>Hi {userFirstName},</Text>
            <Text style={textStyle}>
                We've successfully activated your <strong>{rate} cashback</strong> at <strong>{merchant}</strong>.
            </Text>

            <Section style={boxStyle}>
                <Text style={rateStyle}>{rate}</Text>
                <Text style={labelStyle}>Rewards Rate</Text>
            </Section>

            <Text style={textStyle}>
                <strong>Next Steps:</strong>
                <ol>
                    <li>Complete your purchase in the tab we just opened.</li>
                    <li>Ensure your cart is empty before you start adding items.</li>
                    <li>Avoid using other coupon codes, as they might void cashback.</li>
                </ol>
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                <Button href="https://finleybook.com/wealth" style={buttonStyle}>
                    Back to Wealth Vault
                </Button>
            </Section>

            <Text style={textStyle}>
                We'll notify you as soon as the transaction is tracked (usually within 24-48 hours). Happy shopping!
            </Text>

            <Text style={footerStyle}>
                Happy Saving,<br />
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
    marginBottom: '20px',
};

const textStyle = {
    fontSize: '16px',
    lineHeight: '1.6',
    color: '#333',
    marginBottom: '16px',
};

const boxStyle = {
    backgroundColor: '#eff6ff', // Light blue
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    margin: '24px 0',
    border: '1px solid #dbeafe',
};

const rateStyle = {
    fontSize: '36px',
    color: '#2563eb', // Blue 600
    fontWeight: 'bold',
    margin: '0',
    lineHeight: '1',
};

const labelStyle = {
    fontSize: '14px',
    color: '#666',
    marginTop: '8px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
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
