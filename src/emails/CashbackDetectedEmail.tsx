import {
    Heading,
    Section,
    Text,
    Button,
} from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface CashbackDetectedEmailProps {
    userName: string;
    merchantName: string;
    cashbackAmount: string;
    estimatedPayoutDate: string;
}

export const CashbackDetectedEmail = ({
    userName,
    merchantName,
    cashbackAmount,
    estimatedPayoutDate,
}: CashbackDetectedEmailProps) => (
    <EmailLayout preview={`🎉 Cashback Detected: ${cashbackAmount} from ${merchantName}`}>
        <Heading style={h1}>Cha-ching! 💰</Heading>
        <Text style={text}>
            Hi {userName},
        </Text>
        <Text style={text}>
            Great news! We've detected a new transaction from <strong>{merchantName}</strong>.
        </Text>

        <Section style={card}>
            <Text style={cardTitle}>Pending Cashback</Text>
            <Heading style={amount}>{cashbackAmount}</Heading>
            <Text style={cardSub}>Estimated Payout: {estimatedPayoutDate}</Text>
        </Section>

        <Text style={text}>
            This amount has been added to your <strong>Pending Balance</strong>. Once the merchant confirms the order (usually after the return period), it will move to your Available Balance for withdrawal.
        </Text>

        <Section style={btnContainer}>
            <Button style={button} href="https://finleybook.com/wallet">
                View My Wallet
            </Button>
        </Section>

        <Text style={footer}>
            Keep shopping via FinleyBook to earn more!
        </Text>
    </EmailLayout>
);

export default CashbackDetectedEmail;

const h1 = {
    color: '#1a1a1a',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center' as const,
    margin: '30px 0',
};

const text = {
    color: '#444',
    fontSize: '16px',
    lineHeight: '24px',
    textAlign: 'left' as const,
    padding: '0 40px',
};

const card = {
    backgroundColor: '#f0fdf4',
    borderRadius: '12px',
    padding: '24px',
    margin: '20px 40px',
    textAlign: 'center' as const,
    border: '1px solid #bbf7d0',
};

const cardTitle = {
    color: '#166534',
    fontSize: '14px',
    fontWeight: 'bold',
    textTransform: 'uppercase' as const,
    margin: '0',
};

const amount = {
    color: '#15803d',
    fontSize: '36px',
    fontWeight: 'bold',
    margin: '10px 0',
};

const cardSub = {
    color: '#166534',
    fontSize: '14px',
    margin: '0',
};

const btnContainer = {
    textAlign: 'center' as const,
    marginTop: '32px',
};

const button = {
    backgroundColor: '#000000',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '16px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '12px 24px',
};

const footer = {
    color: '#8898aa',
    fontSize: '12px',
    lineHeight: '16px',
    textAlign: 'center' as const,
    marginTop: '40px',
};
