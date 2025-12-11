import { Button, Text, Heading, Section } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface DataExportReadyEmailProps {
    userFirstName?: string;
    downloadLink?: string;
    format?: string;
}

export default function DataExportReadyEmail({
    userFirstName = 'there',
    downloadLink = 'https://finleybook.com/exports/123',
    format = 'CSV'
}: DataExportReadyEmailProps) {
    return (
        <EmailLayout preview="Your data export is ready">
            <Heading style={headingStyle}>Your Data is Ready</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                The {format} export you requested is now ready for download.
            </Text>

            <Section style={ctaSectionStyle}>
                <Button href={downloadLink} style={buttonStyle}>
                    Download {format} File
                </Button>
            </Section>

            <Text style={textStyle}>
                This link will expire in 24 hours for security reasons.
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
