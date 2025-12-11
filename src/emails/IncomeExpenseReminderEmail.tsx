import { Text, Heading, Section, Row, Column, Link, Hr } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface IncomeExpenseReminderEmailProps {
    userFirstName?: string;
    periodLabel?: string; // e.g. "Today", "This Week", "November"
    totalIn?: string;
    totalOut?: string;
    net?: string;
    balance?: string;
    topCategory?: string;
}

export default function IncomeExpenseReminderEmail({
    userFirstName = 'there',
    periodLabel = 'This Week',
    totalIn = '$1,250.00',
    totalOut = '$450.00',
    net = '+$800.00',
    balance = '$3,450.00',
    topCategory = 'Groceries'
}: IncomeExpenseReminderEmailProps) {
    const isPositive = net.startsWith('+');

    return (
        <EmailLayout preview={`${periodLabel} Snapshot: ${net} Net Change`}>
            {/* Header */}
            <Section style={headerStyle}>
                <Heading style={headerTitle}>{periodLabel} Recap</Heading>
            </Section>

            <Text style={greetingStyle}>Hi {userFirstName},</Text>
            <Text style={textStyle}>
                Here is your financial snapshot for {periodLabel.toLowerCase()}.
            </Text>

            {/* Summary Card */}
            <Section style={cardStyle}>
                <Row>
                    <Column style={columnStyle}>
                        <Text style={labelStyle}>Income</Text>
                        <Text style={incomeValueStyle}>{totalIn}</Text>
                    </Column>
                    <Column style={columnStyle}>
                        <Text style={labelStyle}>Expenses</Text>
                        <Text style={expenseValueStyle}>{totalOut}</Text>
                    </Column>
                </Row>
                <Hr style={dividerStyle} />
                <Row>
                    <Column>
                        <Text style={netLabelStyle}>Net Change</Text>
                        <Text style={{ ...netValueStyle, color: isPositive ? '#10b981' : '#ef4444' }}>
                            {net}
                        </Text>
                    </Column>
                </Row>
            </Section>

            {/* Insights */}
            <Section style={insightSectionStyle}>
                <Text style={insightTextStyle}>
                    <strong>Top Category:</strong> {topCategory}
                </Text>
                <Text style={insightTextStyle}>
                    <strong>Current Balance:</strong> {balance}
                </Text>
            </Section>

            <Section style={ctaSectionStyle}>
                <Link href="https://finleybook.com/dashboard" style={buttonStyle}>
                    View Full Report
                </Link>
            </Section>

            <Text style={footerTextStyle}>
                Keep tracking to stay on top of your wealth.
            </Text>
        </EmailLayout>
    );
}

const headerStyle = {
    marginBottom: '24px',
    textAlign: 'center' as const,
};

const headerTitle = {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#111827',
    margin: '0',
};

const greetingStyle = {
    fontSize: '16px',
    color: '#374151',
    marginBottom: '16px',
};

const textStyle = {
    fontSize: '16px',
    color: '#4b5563',
    lineHeight: '1.5',
    marginBottom: '24px',
};

const cardStyle = {
    backgroundColor: '#f3f4f6',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '24px',
};

const columnStyle = {
    textAlign: 'center' as const,
};

const labelStyle = {
    fontSize: '13px',
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.5px',
    marginBottom: '8px',
    fontWeight: '600',
};

const incomeValueStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981', // Green
    margin: '0',
};

const expenseValueStyle = {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ef4444', // Red
    margin: '0',
};

const dividerStyle = {
    borderColor: '#e5e7eb',
    margin: '16px 0',
};

const netLabelStyle = {
    fontSize: '14px',
    color: '#374151',
    textAlign: 'center' as const,
    marginBottom: '4px',
};

const netValueStyle = {
    fontSize: '28px',
    fontWeight: '900',
    textAlign: 'center' as const,
    margin: '0',
};

const insightSectionStyle = {
    marginBottom: '32px',
    padding: '0 12px',
};

const insightTextStyle = {
    fontSize: '15px',
    color: '#374151',
    marginBottom: '8px',
};

const ctaSectionStyle = {
    textAlign: 'center' as const,
    marginBottom: '32px',
};

const buttonStyle = {
    backgroundColor: '#111827',
    color: '#ffffff',
    padding: '12px 24px',
    borderRadius: '8px',
    textDecoration: 'none',
    fontWeight: 'bold',
    fontSize: '16px',
    display: 'inline-block',
};

const footerTextStyle = {
    fontSize: '14px',
    color: '#9ca3af',
    textAlign: 'center' as const,
    margin: '0',
};
