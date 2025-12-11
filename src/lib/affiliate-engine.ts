import { Merchant } from '@/types/rebate';

export interface AffiliateConfig {
    merchantId: string;
    name: string;
    baseUrl: string;
    affiliateTemplate: string;
    params: Record<string, string>;
    cashbackRate: number;
}

/**
 * Generates a tracking link for a given merchant and user.
 * Replaces placeholders in the template with actual values.
 * 
 * Supported placeholders:
 * - {USER_ID}: The user's ID
 * - {CLICK_ID}: The unique click ID for this session
 * - {PRODUCT_URL}: The original product URL (encoded)
 * - {PRODUCT_ID}: The product ID (ASIN, Item ID, etc.) extracted from URL
 */
export function generateAffiliateLink(
    config: AffiliateConfig,
    userId: string,
    clickId: string,
    productUrl?: string
): string {
    let url = config.affiliateTemplate;

    // 1. Replace standard tracking IDs
    url = url.replace('{USER_ID}', userId);
    url = url.replace('{CLICK_ID}', clickId);

    // 2. Handle Product Specifics
    if (productUrl) {
        // Extract Product ID if needed
        const productId = extractProductId(productUrl, config.name);
        if (productId) {
            url = url.replace('{PRODUCT_ID}', productId);
        }

        // Some templates might want the full encoded destination URL
        // e.g. Impact Radius: https://...&u={PRODUCT_URL}
        url = url.replace('{PRODUCT_URL}', encodeURIComponent(productUrl));
    }

    // 3. Clean up any unused placeholders (optional, or leave them if they might be valid literals)
    // For now, we assume templates are well-formed.

    return url;
}

/**
 * Extracts product ID from a URL based on merchant rules.
 */
function extractProductId(url: string, merchantName: string): string | null {
    if (merchantName.toLowerCase().includes('amazon')) {
        // Handle various Amazon URL formats:
        // /dp/ASIN
        // /gp/product/ASIN
        // /d/ASIN
        // /ASIN (sometimes)
        const patterns = [
            /(?:\/dp\/|\/gp\/product\/|\/d\/|\/)([A-Z0-9]{10})(?:$|\/|\?)/,
            /(?:amzn\.to\/|a\.co\/)([a-zA-Z0-9]+)/ // Short links (need resolution, but regex for safety)
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match) return match[1];
        }
    }
    // Add other merchants here
    return null;
}
