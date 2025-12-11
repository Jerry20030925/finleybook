import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface ReferralSuccessEmailProps {
    userFirstName?: string;
    rewardAmount?: string;
    friendName?: string;
}

export default function ReferralSuccessEmail({
    userFirstName = 'there',
    rewardAmount = '$10.00',
    friendName = 'Alex'
}: ReferralSuccessEmailProps) {
    return (
        <EmailLayout preview={`You earned ${rewardAmount}!`}>
            <Heading style={headingStyle}>Cha-ching! Referral Reward 💸</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                Great news! Your friend <strong>{friendName}</strong> just joined FinleyBook using your link.
            </Text>

            <Section style={rewardBoxStyle}>
                <Text style={labelStyle}>You Earned</Text>
                <Heading style={amountStyle}>{rewardAmount}</Heading>
            </Section>

            <Text style={textStyle}>
                This amount has been added to your wallet. Keep referring friends to earn more!
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/referrals" style={buttonStyle}>
                    Refer More Friends
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                Thanks for spreading the word,<br />
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

const rewardBoxStyle = {
    textAlign: 'center' as const,
    margin: '24px 0',
    padding: '24px',
    backgroundColor: '#f0fdf4', // Green tint
    borderRadius: '12px',
    border: '1px solid #bbf7d0',
};

const labelStyle = {
    fontSize: '14px',
    color: '#166534',
    textTransform: 'uppercase' as const,
    fontWeight: 'bold',
    marginBottom: '8px',
};

const amountStyle = {
    fontSize: '36px',
    fontWeight: '900',
    color: '#15803d',
    margin: '0',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
};

const buttonStyle = {
    backgroundColor: '#16a34a', // Green 600
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
