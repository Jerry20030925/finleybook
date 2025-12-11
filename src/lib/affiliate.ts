import { Merchant } from '@/types/rebate';

/**
 * Generates a tracking link for a given merchant and user.
 * Replaces placeholders in the template with actual values.
 */
export function generateTrackingLink(merchant: Merchant, userId: string, clickId: string): string {
    let url = merchant.tracking_link_template;

    // Replace standard placeholders
    // Commission Factory usually uses UniqueId, UniqueId2, etc.
    // We'll use UniqueId for UserId and UniqueId2 for ClickId (for audit)

    if (url.includes('UniqueId=')) {
        // If it already has UniqueId=, append the value
        // But usually templates are like ...?UniqueId= or ...&UniqueId=
        // Let's assume the template ends with UniqueId= or we need to append it

        // Simple replacement if the template expects us to just append
        // But better to parse URL

        // If template is like: https://t.cfjump.com/12345/t/MERCHANT_ID?UniqueId=
        // We just append userId

        // If we want to add UniqueId2, we need to handle the query params properly

        const separator = url.includes('?') ? '&' : '?';

        // Check if UniqueId is already in the query params
        if (!url.includes('UniqueId=')) {
            url += `${separator}UniqueId=${userId}`;
        } else {
            // If it ends with =, append
            if (url.endsWith('UniqueId=')) {
                url += userId;
            }
        }

        // Add ClickId as UniqueId2
        if (!url.includes('UniqueId2=')) {
            url += `&UniqueId2=${clickId}`;
        }
    } else {
        // Fallback if template doesn't have UniqueId param
        const separator = url.includes('?') ? '&' : '?';
        url += `${separator}UniqueId=${userId}&UniqueId2=${clickId}`;
    }

    return url;
}

/**
 * Validates if a user is eligible for a specific merchant offer.
 * (Placeholder for future logic like geo-restrictions or new-customer-only)
 */
export function isUserEligible(merchant: Merchant, user: any): boolean {
    return true;
}

/**
 * Calculates the user's cashback amount based on their subscription tier.
 * Free: 15% of the commission received.
 * Pro: 50% of the commission received.
 */
export function calculateCommission(commissionAmount: number, isPro: boolean): number {
    const rate = isPro ? 0.50 : 0.15;
    return Math.floor(commissionAmount * rate);
}
