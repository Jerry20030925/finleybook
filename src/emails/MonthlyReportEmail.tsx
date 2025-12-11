import { Button, Text, Section, Heading, Row, Column } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface MonthlyReportEmailProps {
    userFirstName?: string;
    monthName?: string;
    totalSpent?: string;
    totalEarnings?: string;
    topCategory?: string;
    percentage?: string;
}

export default function MonthlyReportEmail({
    userFirstName = 'there',
    monthName = 'December',
    totalSpent = '0.00',
    totalEarnings = '0.00',
    topCategory = 'Shopping',
    percentage = '0'
}: MonthlyReportEmailProps) {
    return (
        <EmailLayout preview={`You spent $${totalSpent}, but guess how much you earned?`}>
            <Heading style={headingStyle}>Your {monthName} Money Wrap 🌯</Heading>
            <Text style={textStyle}>Hey {userFirstName},</Text>
            <Text style={textStyle}>Another month down! Here is a snapshot of your financial health for {monthName}:</Text>

            <Section style={statsBoxStyle}>
                <Row style={rowStyle}>
                    <Column>
                        <Text style={labelStyle}>Total Spent</Text>
                        <Text style={valueStyle}>${totalSpent}</Text>
                    </Column>
                    <Column>
                        <Text style={labelStyle}>Cashback Earned</Text>
                        <Text style={{ ...valueStyle, color: '#16a34a' }}>${totalEarnings}</Text>
                    </Column>
                </Row>
                <Row style={{ ...rowStyle, borderTop: '1px solid #eee', paddingTop: '16px', marginTop: '16px' }}>
                    <Column>
                        <Text style={labelStyle}>Top Category</Text>
                        <Text style={valueStyle}>{topCategory}</Text>
                    </Column>
                </Row>
            </Section>

            <Text style={textStyle}>
                <strong>Did you know?</strong> Your cashback this month covered {percentage}% of your subscription fee. You are practically using FinleyBook for free!
            </Text>

            <Text style={textStyle}>
                Ready to beat this score next month?
            </Text>

            <Section style={{ textAlign: 'center', marginTop: '30px', marginBottom: '30px' }}>
                <Button href="https://finleybook.com/dashboard" style={buttonStyle}>
                    See Full Report
                </Button>
            </Section>

            <Text style={footerStyle}>
                Best,<br />
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

const statsBoxStyle = {
    backgroundColor: '#f9fafb',
    padding: '24px',
    borderRadius: '12px',
    margin: '24px 0',
    border: '1px solid #e5e7eb',
};

const rowStyle = {
    width: '100%',
};

const labelStyle = {
    fontSize: '12px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    marginBottom: '4px',
};

const valueStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#111',
    margin: '0',
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
