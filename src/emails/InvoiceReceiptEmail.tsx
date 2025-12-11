import { Button, Text, Heading, Section, Row, Column, Hr } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface InvoiceReceiptEmailProps {
    userFirstName?: string;
    invoiceId?: string;
    date?: string;
    amount?: string;
    planName?: string;
    downloadLink?: string;
}

export default function InvoiceReceiptEmail({
    userFirstName = 'there',
    invoiceId = 'INV-2025-001',
    date = 'Dec 4, 2025',
    amount = '$19.99',
    planName = 'FinleyBook Pro (Monthly)',
    downloadLink = 'https://finleybook.com/invoices/123'
}: InvoiceReceiptEmailProps) {
    return (
        <EmailLayout preview={`Receipt for ${planName}`}>
            <Heading style={headingStyle}>Payment Receipt</Heading>

            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                This is a receipt for your recent payment. Thanks for using FinleyBook!
            </Text>

            <Section style={receiptBoxStyle}>
                <Row style={rowStyle}>
                    <Column>
                        <Text style={labelStyle}>Amount Paid</Text>
                        <Text style={valueStyle}>{amount}</Text>
                    </Column>
                    <Column style={{ textAlign: 'right' }}>
                        <Text style={labelStyle}>Date</Text>
                        <Text style={valueStyle}>{date}</Text>
                    </Column>
                </Row>
                <Hr style={hrStyle} />
                <Row style={rowStyle}>
                    <Column>
                        <Text style={labelStyle}>Description</Text>
                        <Text style={valueStyle}>{planName}</Text>
                    </Column>
                </Row>
                <Hr style={hrStyle} />
                <Row style={rowStyle}>
                    <Column>
                        <Text style={labelStyle}>Invoice ID</Text>
                        <Text style={valueStyle}>{invoiceId}</Text>
                    </Column>
                </Row>
            </Section>

            <Section style={ctaSectionStyle}>
                <Button href={downloadLink} style={buttonStyle}>
                    Download Invoice PDF
                </Button>
            </Section>

            <Text style={footerTextStyle}>
                If you have any questions about this invoice, just reply to this email.
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

const receiptBoxStyle = {
    backgroundColor: '#f9fafb',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
    border: '1px solid #e5e7eb',
};

const rowStyle = {
    marginBottom: '12px',
};

const labelStyle = {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '4px',
};

const valueStyle = {
    fontSize: '16px',
    color: '#111',
    fontWeight: 'bold',
    margin: '0',
};

const hrStyle = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
    marginTop: '32px',
};

const buttonStyle = {
    backgroundColor: '#ffffff',
    color: '#111111',
    border: '1px solid #e5e7eb',
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
