import { Metadata } from 'next'

type Props = {
    params: { id: string }
    children: React.ReactNode
}

export async function generateMetadata(
    { params }: Props
): Promise<Metadata> {
    return {
        title: 'FinleyBook Reports | Insights Center',
        description: 'FinleyBook intelligence reports and planning insights.',
        alternates: {
            canonical: '/reports',
        },
        robots: {
            index: false,
            follow: false,
        },
    }
}

export default function ProductLayout({
    children,
}: Props) {
    return children
}
