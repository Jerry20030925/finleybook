import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
} from "@react-email/components";
import * as React from "react";

// 定义邮件接受的数据类型
interface WeeklyReportProps {
    userName?: string;
    savedAmount?: string;
    topCategory?: string;
    nextBillName?: string;
    nextBillAmount?: string;
}

// 自动判断图片的基础路径
// 如果是在本地开发，使用本地服务器；如果部署了，使用你的域名
const baseUrl = process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : ""; // 本地调试时可能需要手动写死 'http://localhost:3000'

export const WeeklyReportEmail = ({
    userName = "Alex",
    savedAmount = "125.00",
    topCategory = "Takeout",
    nextBillName = "Netflix",
    nextBillAmount = "16.99",
}: WeeklyReportProps) => {
    return (
        <Html>
            <Head />
            <Preview>You saved ${savedAmount} this week! Check your financial report 🚀</Preview>
            <Body style={main}>
                <Container style={container}>
                    {/* --- 1. Logo Area --- */}
                    <Section style={box}>
                        <Img
                            // Key point: Must be an absolute path
                            src={`${baseUrl}/static/finley-logo.png`}
                            width="50"
                            height="50"
                            alt="FinleyBook Logo"
                            style={logo}
                        />
                        <Heading style={h1}>FinleyBook</Heading>
                        <Hr style={hr} />

                        {/* --- 2. Core Savings Data --- */}
                        <Text style={paragraph}>
                            Hi <strong>{userName}</strong>,
                        </Text>
                        <Text style={paragraph}>
                            How was your week? Your financial performance is outstanding! According to our calculations, by cutting unnecessary expenses, you saved a total of:
                        </Text>

                        {/* Visual Focus: Green Big Number */}
                        <Section style={statSection}>
                            <Text style={statValue}>+${savedAmount}</Text>
                            <Text style={statLabel}>Saved This Week</Text>
                        </Section>

                        {/* --- 3. Insights & Warnings --- */}
                        <Section style={insightBox}>
                            <Text style={paragraph}>
                                🍔 <strong>Spending Review:</strong> You spent the most on "{topCategory}" this week. We suggest setting a small budget for next week.
                            </Text>
                            <Text style={paragraph}>
                                ⚠️ <strong>Bill Alert:</strong> Your <strong>{nextBillName}</strong> subscription will charge <strong>${nextBillAmount}</strong> in 2 days. If you're not using it, remember to cancel!
                            </Text>
                        </Section>

                        {/* --- 4. CTA Button --- */}
                        <Section style={btnContainer}>
                            <Button
                                style={button}
                                href="https://finleybook.com/dashboard"
                            >
                                View Full Report & Save
                            </Button>
                        </Section>

                        <Text style={footer}>
                            Make every penny work for you.<br />
                            FinleyBook Team
                        </Text>
                    </Section>

                    {/* --- 5. Footer Copyright --- */}
                    <Text style={footerText}>
                        If you don't want to receive these reports, you can <Link href="#" style={link}>unsubscribe</Link>.
                        <br />
                        Sydney, Australia
                    </Text>
                </Container>
            </Body>
        </Html>
    );
};

export default WeeklyReportEmail;

// 邮件样式必须写在 JS 对象里，因为 Gmail 不支持外部 CSS 文件

const main = {
    backgroundColor: "#f6f9fc",
    fontFamily:
        '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
    backgroundColor: "#ffffff",
    margin: "0 auto",
    padding: "20px 0 48px",
    marginBottom: "64px",
};

const box = {
    padding: "0 48px",
};

const hr = {
    borderColor: "#e6ebf1",
    margin: "20px 0",
};

const logo = {
    margin: "0 auto",
    marginBottom: "10px",
    display: "block", // 让 Logo 居中
};

const h1 = {
    color: "#333",
    fontSize: "24px",
    fontWeight: "bold",
    textAlign: "center" as const,
    margin: "0",
};

const paragraph = {
    color: "#525f7f",
    fontSize: "16px",
    lineHeight: "24px",
    textAlign: "left" as const,
};

const statSection = {
    textAlign: "center" as const,
    margin: "30px 0",
    padding: "20px",
    backgroundColor: "#f0fdf4", // 浅绿色背景
    borderRadius: "12px",
    border: "1px solid #bbf7d0",
};

const statValue = {
    fontSize: "36px",
    fontWeight: "bold",
    color: "#16a34a", // 绿色文字
    margin: "0",
};

const statLabel = {
    fontSize: "14px",
    color: "#15803d",
    textTransform: "uppercase" as const,
    letterSpacing: "1px",
    margin: "5px 0 0",
};

const insightBox = {
    backgroundColor: "#fff1f2", // 浅红色背景 (警示)
    padding: "15px",
    borderRadius: "8px",
    borderLeft: "4px solid #f43f5e",
    marginBottom: "24px",
};

const btnContainer = {
    textAlign: "center" as const,
};

const button = {
    backgroundColor: "#000000", // 黑色高级感按钮
    borderRadius: "50px", // 圆角
    color: "#fff",
    fontSize: "16px",
    fontWeight: "bold",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "block",
    padding: "12px 30px",
};

const footer = {
    color: "#8898aa",
    fontSize: "14px",
    lineHeight: "22px",
    marginTop: "20px",
};

const footerText = {
    color: "#8898aa",
    fontSize: "12px",
    lineHeight: "16px",
    textAlign: "center" as const,
    marginTop: "30px",
};

const link = {
    color: "#8898aa",
};
