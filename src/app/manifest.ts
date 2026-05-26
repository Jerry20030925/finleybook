import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'FinleyBook - Professional AI Wealth Intelligence',
        short_name: 'FinleyBook',
        description: 'Track net worth, manage budgets, and run professional financial reports with practical AI guidance.',
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
