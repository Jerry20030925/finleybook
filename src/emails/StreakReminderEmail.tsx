import { Text, Button, Section } from '@react-email/components';
import * as React from 'react';
import { EmailLayout } from './components/EmailLayout';

interface StreakReminderEmailProps {
    userFirstName?: string;
    streakCount?: number;
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://finleybook.com';

export const StreakReminderEmail = ({
    userFirstName = 'there',
    streakCount = 3,
}: StreakReminderEmailProps) => {
    const previewText = `Don't let your ${streakCount} day streak burn out! 🔥`;
    const unsubscribeUrl = `${baseUrl}/unsubscribe`;

    return (
        <EmailLayout preview={previewText} unsubscribeUrl={unsubscribeUrl}>
            <Section style={{ textAlign: 'center', marginBottom: '24px' }}>
                <Text style={{ fontSize: '48px', margin: '0', lineHeight: '1' }}>🔥</Text>
            </Section>

            <Text style={headingStyle}>
                Keep the flame alive, <strong>{userFirstName}</strong>!
            </Text>

            <Text style={textStyle}>
                You&apos;re currently on a <strong>{streakCount} day streak</strong>, but we haven&apos;t seen you today.
            </Text>

            <Text style={textStyle}>
                Log in before midnight to keep your progress burning. Consistency is the key to financial success!
            </Text>

            <Section style={{ textAlign: 'center', margin: '32px 0' }}>
                <Button
                    href={`${baseUrl}/dashboard`}
                    style={buttonStyle}
                >
                    Ignite My Streak
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                Cheers,<br />
                The FinleyBook Team
            </Text>
        </EmailLayout>
    );
};

const headingStyle = {
    fontSize: '22px',
    fontWeight: 'normal' as const,
    textAlign: 'center' as const,
    color: '#111827',
    margin: '0 0 16px 0',
};

const textStyle = {
    fontSize: '14px',
    lineHeight: '24px',
    color: '#333',
    marginBottom: '16px',
};

const buttonStyle = {
    backgroundColor: '#ea580c',
    borderRadius: '6px',
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold' as const,
    textDecoration: 'none',
    textAlign: 'center' as const,
    padding: '12px 24px',
    display: 'inline-block' as const,
};

const footerTextStyle = {
    fontSize: '12px',
    lineHeight: '24px',
    color: '#666666',
};

export default StreakReminderEmail;
