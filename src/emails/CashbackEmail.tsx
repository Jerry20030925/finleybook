import { Button, Text, Section, Heading } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface CashbackEmailProps {
    userFirstName?: string;
    amount?: string;
    merchant?: string;
}

export default function CashbackEmail({ userFirstName = 'there', amount = '0.00', merchant = 'Merchant' }: CashbackEmailProps) {
    return (
        <EmailLayout preview={`You just earned $${amount} from ${merchant}.`}>
            <Heading style={headingStyle}>💸 Cha-ching!</Heading>
            <Text style={textStyle}>Great news, {userFirstName}!</Text>
            <Text style={textStyle}>We successfully tracked your recent purchase at <strong>{merchant}</strong>.</Text>

            <Section style={boxStyle}>
                <Text style={amountStyle}>+${amount}</Text>
                <Text style={labelStyle}>Estimated Cashback</Text>
            </Section>

            <Text style={textStyle}>
                <strong>What happens next?</strong> The merchant is currently verifying the transaction. This usually takes a few weeks (to ensure no returns were made). Once approved, the funds will move to your "Available Balance."
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                <Button href="https://finleybook.com/wallet" style={buttonStyle}>
                    View My Wallet
                </Button>
            </Section>

            <Text style={textStyle}>
                Keep that streak alive! Check out today's boosted rates on your dashboard.
            </Text>

            <Text style={footerStyle}>
                Cheers,<br />
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
    backgroundColor: '#f0fdf4', // Light green
    padding: '24px',
    borderRadius: '12px',
    textAlign: 'center' as const,
    margin: '24px 0',
    border: '1px solid #bbf7d0',
};

const amountStyle = {
    fontSize: '36px',
    color: '#16a34a', // Green 600
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
