import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface NewDeviceLoginEmailProps {
    userFirstName?: string;
    device?: string;
    location?: string;
    time?: string;
    ip?: string;
}

export default function NewDeviceLoginEmail({
    userFirstName = 'there',
    device = 'Chrome on macOS',
    location = 'Sydney, Australia',
    time = 'Just now',
    ip = '192.168.1.1'
}: NewDeviceLoginEmailProps) {
    return (
        <EmailLayout preview="New login detected">
            <Heading style={headingStyle}>New Login Detected</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                We detected a new login to your FinleyBook account.
            </Text>

            <Section style={infoBoxStyle}>
                <Text style={infoRowStyle}><strong>Device:</strong> {device}</Text>
                <Text style={infoRowStyle}><strong>Location:</strong> {location}</Text>
                <Text style={infoRowStyle}><strong>Time:</strong> {time}</Text>
                <Text style={infoRowStyle}><strong>IP Address:</strong> {ip}</Text>
            </Section>

            <Text style={textStyle}>
                If this was you, you can safely ignore this email.
            </Text>

            <Text style={warningTextStyle}>
                If you don't recognize this activity, please secure your account immediately.
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href="https://finleybook.com/settings/security" style={buttonStyle}>
                    Secure My Account
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                Stay safe,<br />
                The FinleyBook Security Team
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

const infoBoxStyle = {
    backgroundColor: '#fff1f2', // Light red/rose tint
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #fecdd3',
};

const infoRowStyle = {
    fontSize: '15px',
    color: '#374151',
    marginBottom: '8px',
    display: 'block',
};

const warningTextStyle = {
    fontSize: '16px',
    color: '#b91c1c', // Red 700
    fontWeight: 'bold',
    marginBottom: '16px',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
};

const buttonStyle = {
    backgroundColor: '#dc2626', // Red 600
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
