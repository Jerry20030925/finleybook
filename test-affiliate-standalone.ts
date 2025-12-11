// Standalone test to verify logic without build system issues

interface AffiliateConfig {
    merchantId: string;
    name: string;
    baseUrl: string;
    affiliateTemplate: string;
    params: Record<string, string>;
    cashbackRate: number;
}

function generateAffiliateLink(
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
        url = url.replace('{PRODUCT_URL}', encodeURIComponent(productUrl));
    }

    return url;
}

function extractProductId(url: string, merchantName: string): string | null {
    if (merchantName.toLowerCase() === 'amazon') {
        const match = url.match(/(?:dp|gp\/product|\/d)\/([A-Z0-9]{10})/);
        return match ? match[1] : null;
    }
    return null;
}

// --- TEST EXECUTION ---

const mockMerchant: AffiliateConfig = {
    merchantId: 'amazon',
    name: 'Amazon',
    baseUrl: 'amazon.com',
    affiliateTemplate: 'https://www.amazon.com/dp/{PRODUCT_ID}?tag=finleybook-20&ascsubtag={CLICK_ID}',
    params: { tag: 'finleybook-20' },
    cashbackRate: 0.05
};

const userId = 'user_123';
const clickId = 'click_abc';
const productUrl = 'https://www.amazon.com/dp/B08N5KWB9H';

console.log('Testing Affiliate Link Generation (Standalone)...');

const link = generateAffiliateLink(mockMerchant, userId, clickId, productUrl);
console.log('Generated Link:', link);

const expected = 'https://www.amazon.com/dp/B08N5KWB9H?tag=finleybook-20&ascsubtag=click_abc';

if (link === expected) {
    console.log('✅ Test Passed');
} else {
    console.error('❌ Test Failed');
    console.error('Expected:', expected);
    console.error('Actual:', link);
    process.exit(1);
}
