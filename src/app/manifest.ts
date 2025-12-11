import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FinleyBook - AI Wealth Tracker',
        short_name: 'FinleyBook',
        description: 'Track net worth, find price glitches, and earn cashback with AI.',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4f46e5',
        icons: [
            {
                src: '/icon.png',
                sizes: 'any',
                type: 'image/png',
            },
        ],
    }
}
