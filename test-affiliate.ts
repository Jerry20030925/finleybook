import { generateAffiliateLink, AffiliateConfig } from './src/lib/affiliate-engine';

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

console.log('Testing Affiliate Link Generation...');

const link = generateAffiliateLink(mockMerchant, userId, clickId, productUrl);
console.log('Generated Link:', link);

const expected = 'https://www.amazon.com/dp/B08N5KWB9H?tag=finleybook-20&ascsubtag=click_abc';

if (link === expected) {
    console.log('✅ Test Passed');
} else {
    console.error('❌ Test Failed');
    console.error('Expected:', expected);
    console.error('Actual:', link);
}
