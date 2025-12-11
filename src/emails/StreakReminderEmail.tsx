import {
    Body,
    Button,
    Container,
    Head,
    Heading,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Tailwind,
} from '@react-email/components';
import * as React from 'react';

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

    return (
        <Html>
            <Head />
            <Preview>{previewText}</Preview>
            <Tailwind>
                <Body className="bg-white my-auto mx-auto font-sans">
                    <Container className="border border-solid border-[#eaeaea] rounded my-[40px] mx-auto p-[20px] max-w-[465px]">
                        <Section className="mt-[32px] text-center">
                            <Text className="text-[48px] m-0">🔥</Text>
                        </Section>
                        <Heading className="text-black text-[24px] font-normal text-center p-0 my-[30px] mx-0">
                            Keep the flame alive, <strong>{userFirstName}</strong>!
                        </Heading>
                        <Text className="text-black text-[14px] leading-[24px]">
                            You're currently on a <strong>{streakCount} day streak</strong>, but we haven't seen you today.
                        </Text>
                        <Text className="text-black text-[14px] leading-[24px]">
                            Log in before midnight to keep your progress burning. Consistency is the key to financial success!
                        </Text>
                        <Section className="text-center mt-[32px] mb-[32px]">
                            <Button
                                className="bg-[#ea580c] rounded text-white text-[12px] font-semibold no-underline text-center px-5 py-3"
                                href={`${baseUrl}/dashboard`}
                            >
                                Ignite My Streak
                            </Button>
                        </Section>
                        <Text className="text-[#666666] text-[12px] leading-[24px]">
                            Cheers,<br />
                            The FinleyBook Team
                        </Text>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
};

export default StreakReminderEmail;
