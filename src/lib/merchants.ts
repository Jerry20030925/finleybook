import { Merchant } from '@/types/rebate';

export const MOVIE_MERCHANTS: Merchant[] = [
    {
        id: 'event-cinemas',
        name: 'Event Cinemas',
        logo_url: '/static/event-cinemas.png',
        description: 'Earn cashback on movie tickets & gift cards',
        category: 'Entertainment',
        affiliate_network: 'COMMISSION_FACTORY',
        base_commission_rate: 0.05,
        tracking_link_template: 'https://www.eventcinemas.com.au/?affid=YOUR_ID&subid=',
        is_featured: true
    },
    {
        id: 'hoyts',
        name: 'Hoyts Cinemas',
        logo_url: '/static/hoyts.png',
        description: 'Cashback on tickets and candy bar via Gift Cards',
        category: 'Entertainment',
        affiliate_network: 'COMMISSION_FACTORY',
        base_commission_rate: 0.04,
        tracking_link_template: 'https://www.hoyts.com.au/?affid=YOUR_ID&subid=',
        is_featured: true
    },
    {
        id: 'klook-movies',
        name: 'Klook Movies',
        logo_url: '/static/klook.png',
        description: 'Discounted movie vouchers & experiences',
        category: 'Entertainment',
        affiliate_network: 'COMMISSION_FACTORY',
        base_commission_rate: 0.06,
        tracking_link_template: 'https://www.klook.com/en-AU/?affid=YOUR_ID&subid=',
        is_featured: true
    },
    {
        id: 'viator-movies',
        name: 'Viator',
        logo_url: '/static/viator.png',
        description: 'Movie world tickets & entertainment packages',
        category: 'Entertainment',
        affiliate_network: 'COMMISSION_FACTORY',
        base_commission_rate: 0.08,
        tracking_link_template: 'https://www.viator.com/?affid=YOUR_ID&subid=',
        is_featured: true
    }
];
