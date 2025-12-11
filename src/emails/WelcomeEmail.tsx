import { Text, Link } from "@react-email/components";
import * as React from 'react';
import { EmailLayout } from "./components/EmailLayout";

interface WelcomeEmailProps {
    userFirstName?: string;
}

export default function WelcomeEmail({ userFirstName = 'there' }: WelcomeEmailProps) {
    return (
        <EmailLayout preview="Quick hello from Jerry">
            <Text style={textStyle}>Hi {userFirstName},</Text>

            <Text style={textStyle}>
                I'm Jerry, the founder of FinleyBook.
            </Text>

            <Text style={textStyle}>
                I built this because I was tired of budgeting apps that just showed me where I was losing money. I wanted something that actually helped me save.
            </Text>

            <Text style={textStyle}>
                To get started, just go to the <Link href="https://finleybook.com/wealth" style={linkStyle}>Wealth Vault</Link> tab and click a link before you shop.
            </Text>

            <Text style={textStyle}>
                That's it. We track it and add the cash to your wallet.
            </Text>

            <Text style={textStyle}>
                If you have any questions, just hit reply. I read every email.
            </Text>

            <Text style={textStyle}>
                Best,
            </Text>

            <Text style={textStyle}>
                Jerry
            </Text>
        </EmailLayout>
    );
}

const textStyle = {
    fontSize: '15px',
    lineHeight: '1.5',
    color: '#333',
    marginBottom: '16px',
};

const linkStyle = {
    color: '#2563eb',
    textDecoration: 'underline',
};
