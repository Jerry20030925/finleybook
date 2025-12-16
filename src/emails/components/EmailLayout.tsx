import { Html, Head, Body, Container, Section, Img, Text, Link, Preview, Hr, Column, Row } from "@react-email/components";
import * as React from 'react';

interface EmailLayoutProps {
    children: React.ReactNode;
    preview?: string;
    unsubscribeUrl?: string;
}

export const EmailLayout = ({ children, preview, unsubscribeUrl }: EmailLayoutProps) => {
    return (
        <Html>
            <Head />
            {preview && <Preview>{preview}</Preview>}
            <Body style={mainStyle}>
                <Container style={containerStyle}>
                    {/* Header with Logo */}
                    <Section style={headerStyle}>
                        <Img
                            src="https://finleybook.com/email-logo.png"
                            width="48"
                            height="48"
                            alt="FinleyBook"
                            style={logoStyle}
                        />
                    </Section>

                    {/* Main Content */}
                    <Section style={contentStyle}>
                        {children}
                    </Section>

                    {/* Footer */}
                    <Section style={footerStyle}>
                        <Hr style={hrStyle} />

                        {/* Affiliate Disclosure */}
                        <Text style={footerTextStyle}>
                            <strong>Affiliate Disclosure:</strong><br />
                            FinleyBook may earn a commission from qualifying purchases made through affiliate links.
                            This comes at no extra cost to you and helps support the platform.
                        </Text>


                        {/* Social Icons */}
                        <Text style={{ textAlign: 'center', margin: '20px 0' }}>
                            <Link href="https://www.linkedin.com/company/finleybook/" target="_blank" style={{ margin: '0 8px', display: 'inline-block' }}>
                                <Img src="https://cdn-icons-png.flaticon.com/512/3536/3536505.png" width="32" height="32" alt="LinkedIn" />
                            </Link>
                            <Link href="https://instagram.com/finleybook1" target="_blank" style={{ margin: '0 8px', display: 'inline-block' }}>
                                <Img src="https://cdn-icons-png.flaticon.com/512/2111/2111463.png" width="32" height="32" alt="Instagram" />
                            </Link>
                            <Link href="https://www.tiktok.com/@finleybook1?_r=1&_t=ZS-923DYtBDdrs" target="_blank" style={{ margin: '0 8px', display: 'inline-block' }}>
                                <Img src="https://cdn-icons-png.flaticon.com/512/3046/3046121.png" width="32" height="32" alt="TikTok" />
                            </Link>
                            <Link href="https://x.com/finleybook1" target="_blank" style={{ margin: '0 8px', display: 'inline-block' }}>
                                <Img src="https://cdn-icons-png.flaticon.com/512/5969/5969020.png" width="32" height="32" alt="X (Twitter)" />
                            </Link>
                        </Text>

                        {/* Legal Links */}
                        <Text style={footerLinksStyle}>
                            <Link href="https://finleybook.com/privacy" style={linkStyle}>Privacy Policy</Link>
                            <span style={separatorStyle}>|</span>
                            <Link href="https://finleybook.com/terms" style={linkStyle}>Terms of Service</Link>
                            {unsubscribeUrl && (
                                <>
                                    <span style={separatorStyle}>|</span>
                                    <Link href={unsubscribeUrl} style={linkStyle}>Unsubscribe</Link>
                                </>
                            )}
                        </Text>

                        {/* Copyright */}
                        <Text style={copyrightStyle}>
                            © 2025 FinleyBook. All rights reserved.
                        </Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

const mainStyle = {
    backgroundColor: '#ffffff',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
};

const containerStyle = {
    margin: '0 auto',
    padding: '20px 0 48px',
    maxWidth: '580px',
};

const headerStyle = {
    padding: '20px 0',
    textAlign: 'center' as const,
};

const logoStyle = {
    margin: '0 auto',
};

const contentStyle = {
    padding: '0 20px',
};

const footerStyle = {
    marginTop: '32px',
    textAlign: 'center' as const,
};

const hrStyle = {
    borderColor: '#e6ebf1',
    margin: '20px 0',
};

const footerTextStyle = {
    fontSize: '12px',
    lineHeight: '1.5',
    color: '#8898aa',
    marginBottom: '12px',
};

const footerLinksStyle = {
    fontSize: '12px',
    color: '#8898aa',
    marginBottom: '8px',
};

const linkStyle = {
    color: '#8898aa',
    textDecoration: 'underline',
};

const separatorStyle = {
    margin: '0 8px',
    color: '#d8d8d8',
};

const copyrightStyle = {
    fontSize: '12px',
    color: '#9ca3af',
    marginTop: '12px',
};
