// Shared Timestamp interface compatible with both client (firebase/firestore) and admin (firebase-admin) SDKs
export interface FirestoreTimestamp {
    seconds: number;
    nanoseconds: number;
    toDate?: () => Date;
}

// User Document Extension
export interface UserDocument {
    uid: string;
    email: string;
    subscription: {
        plan: 'free' | 'pro';
        status: 'active' | 'cancelled';
        expiryDate: FirestoreTimestamp;
    };
    wallet_snapshot: {
        available_balance: number; // Unit: cents
        pending_balance: number;   // Amount waiting for merchant confirmation
        lifetime_earnings: number; // Total earnings (vanity metric)
    };
    affiliate_settings: {
        commission_factory_id?: string; // Encrypted ID for tracking
        stripe_account_id?: string;    // Stripe Connect Account ID
        paypal_email?: string;
    };
    isAdmin?: boolean;
}

// Double-Entry Ledger Transaction
export interface LedgerTransaction {
    userId: string;
    type: 'COMMISSION_TRACKED' | 'COMMISSION_APPROVED' | 'PAYOUT_REQUEST' | 'PAYOUT_FEE' | 'BONUS';
    amount: number; // Positive for credit, Negative for debit
    currency: string; // "AUD"
    status: 'PENDING' | 'CLEARED' | 'VOIDED';
    source: {
        network: 'COMMISSION_FACTORY' | 'IMPACT' | 'SYSTEM';
        external_ref_id: string; // Affiliate Network Transaction ID
        merchant_name: string;
    };
    metadata: {
        commission_rate_applied: number; // e.g., 0.5 for 50%, 1.0 for 100%
        user_tier_at_time: 'free' | 'pro';
    };
    created_at: FirestoreTimestamp;
    updated_at: FirestoreTimestamp;
}

// Click Tracking Event
export interface ClickEvent {
    id?: string; // Firestore Document ID (Click ID)
    userId: string;
    merchantId?: string;
    merchantName?: string;
    type: 'CASHBACK' | 'BOUNTY' | 'GLITCH';
    targetUrl?: string;
    click_time: FirestoreTimestamp;
    user_ip?: string;
    user_agent?: string;
    status?: 'CREATED' | 'REDIRECTED';
}

export type TransactionStatus = 'PENDING' | 'APPROVED' | 'PAYABLE' | 'DECLINED' | 'PAID';

export interface Transaction {
    id?: string; // Firestore Document ID
    userId: string;
    clickId: string; // Link back to the Click
    merchantId?: string;
    merchantName?: string;

    // External Data from Network
    externalTxId: string; // Order ID from CF/Impact
    networkStatus: string; // Raw status string

    // Financials
    orderAmount: number;
    commissionAmount: number;
    userCashbackAmount: number;
    currency: string;

    // System Status
    status: TransactionStatus;

    occurredAt: FirestoreTimestamp; // When the purchase happened
    createdAt: FirestoreTimestamp; // When we received the webhook
    updatedAt: FirestoreTimestamp;
}

export interface UserWealthProfile {
    pendingBalance: number;
    availableBalance: number;
    lifetimeEarnings: number;
    stripeAccountId?: string;
}

// Merchant Definition
export interface Merchant {
    id: string;
    name: string;
    logo_url: string;
    description: string;
    category: string;
    affiliate_network: 'COMMISSION_FACTORY' | 'IMPACT';
    base_commission_rate: number; // e.g., 0.10 for 10%
    tracking_link_template: string; // e.g., https://t.cfjump.com/12345/t/MERCHANT_ID?UniqueId=
    is_featured?: boolean;
    terms?: string;
    boost_rate?: number; // e.g. 0.15 for 15% (Temporary Boost)
    boost_end_time?: FirestoreTimestamp;
    tags?: string[]; // search keywords
}

// Wealth Vault Item Types
export type WealthItemType = 'CASHBACK' | 'BOUNTY' | 'GLITCH';

// Bank Bounty Definition
export interface Bounty {
    id: string;
    title: string; // e.g., "ING Bank"
    description: string; // e.g., "Open Everyday account + deposit $1000"
    reward_amount: number; // e.g., 7500 (cents)
    difficulty: 'EASY' | 'MEDIUM' | 'HARD';
    steps: string[];
    link: string;
    is_pro_exclusive?: boolean;
    expires_at?: FirestoreTimestamp;
}

// Price Glitch Definition
export interface Glitch {
    id: string;
    title: string; // e.g., "Sony WH-1000XM5"
    description: string; // e.g., "Price error at Officeworks"
    original_price: number;
    glitch_price: number;
    retailer: string;
    link: string;
    found_at: FirestoreTimestamp;
    expires_at?: FirestoreTimestamp; // Estimated fix time
    is_active: boolean;
}

export interface Referral {
    id: string;
    referrerId: string;
    refereeId: string;
    codeUsed: string;
    status: 'PENDING' | 'COMPLETED';
    rewardType: 'PRO_DAYS';
    rewardValue: number; // e.g. 30 (days)
    createdAt: FirestoreTimestamp;
}
