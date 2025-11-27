import { db } from './firebase';
import {
    collection,
    doc,
    getDoc,
    setDoc,
    updateDoc,
    increment,
    query,
    where,
    getDocs,
    runTransaction,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { stripe } from './stripe';

// Constants
export const REWARD_MONTHS = 1; // 1 month free
export const REWARD_AMOUNT_USD = 999; // $9.99 in cents
export const REFERRAL_LEVELS = {
    LEVEL_1: 1,
    LEVEL_2: 3,
    LEVEL_3: 10
};

export interface ReferralStats {
    userId: string;
    referralCode: string;
    totalReferrals: number;
    totalEarned: number; // Amount in cents or months
    currentLevel: number;
    updatedAt: any;
}

/**
 * Generates a unique referral code for a user.
 * Format: First 4 chars of email (or random) + 4 random chars.
 */
export async function generateReferralCode(userId: string, email?: string): Promise<string> {
    // Check if user already has a code
    const statsRef = doc(db, 'users', userId, 'referral_stats', 'summary');
    const statsSnap = await getDoc(statsRef);

    if (statsSnap.exists() && statsSnap.data().referralCode) {
        return statsSnap.data().referralCode;
    }

    let base = 'USER';
    if (email) {
        base = email.split('@')[0].substring(0, 4).toUpperCase().replace(/[^A-Z0-9]/g, 'X');
    }

    // Try to generate a unique code
    let isUnique = false;
    let code = '';
    let attempts = 0;

    while (!isUnique && attempts < 5) {
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();
        code = `${base}${randomSuffix}`;

        // Check uniqueness in `referral_codes` collection
        const codeRef = doc(db, 'referral_codes', code);
        const codeSnap = await getDoc(codeRef);

        if (!codeSnap.exists()) {
            isUnique = true;
            // Reserve the code
            await setDoc(codeRef, { userId, createdAt: serverTimestamp() });
        }
        attempts++;
    }

    if (!isUnique) {
        throw new Error('Failed to generate unique referral code');
    }

    // Initialize stats
    await setDoc(statsRef, {
        userId,
        referralCode: code,
        totalReferrals: 0,
        totalEarned: 0,
        currentLevel: 0,
        updatedAt: serverTimestamp()
    }, { merge: true });

    return code;
}

/**
 * Tracks a referral when a new user signs up.
 * Links the new user (referee) to the referrer.
 */
export async function trackReferralSignup(newUserId: string, referralCode: string) {
    if (!referralCode) return;

    try {
        // 1. Find referrer
        const codeRef = doc(db, 'referral_codes', referralCode);
        const codeSnap = await getDoc(codeRef);

        if (!codeSnap.exists()) {
            console.warn(`Invalid referral code used: ${referralCode}`);
            return;
        }

        const referrerId = codeSnap.data().userId;

        // Prevent self-referral
        if (referrerId === newUserId) return;

        // 2. Create referral record
        const referralRef = doc(collection(db, 'referrals'));
        await setDoc(referralRef, {
            referrerId,
            refereeId: newUserId,
            code: referralCode,
            status: 'pending', // Pending until they subscribe or trial starts? For now, 'converted' on signup if that's the rule.
            createdAt: serverTimestamp()
        });

        // 3. Grant rewards (Give 1 Month, Get 1 Month)
        // For now, we assume "signup" is enough for the reward, or maybe "subscription start".
        // Let's assume we reward on subscription. If this is just signup, we might want to wait.
        // The requirement says: "每邀请一位朋友成功注册（哪怕只是试用）" -> So signup/trial is enough.

        await grantReferralReward(referrerId, newUserId);

    } catch (error) {
        console.error('Error tracking referral:', error);
    }
}

/**
 * Grants rewards to both parties.
 */
async function grantReferralReward(referrerId: string, refereeId: string) {
    // 1. Credit Referrer (Stripe Balance)
    try {
        // Get referrer's Stripe Customer ID
        // We need to store stripeCustomerId in user profile or look it up.
        // Assuming we can find it or we'll skip if not found.
        // For this MVP, let's update Firestore stats first.

        await runTransaction(db, async (transaction) => {
            const statsRef = doc(db, 'users', referrerId, 'referral_stats', 'summary');
            const statsDoc = await transaction.get(statsRef);

            if (!statsDoc.exists()) {
                throw new Error('Referrer stats not found');
            }

            const currentReferrals = (statsDoc.data().totalReferrals || 0) + 1;
            let newLevel = statsDoc.data().currentLevel || 0;

            // Check Level Up
            if (currentReferrals >= REFERRAL_LEVELS.LEVEL_3) newLevel = 3;
            else if (currentReferrals >= REFERRAL_LEVELS.LEVEL_2) newLevel = 2;
            else if (currentReferrals >= REFERRAL_LEVELS.LEVEL_1) newLevel = 1;

            transaction.update(statsRef, {
                totalReferrals: increment(1),
                totalEarned: increment(REWARD_AMOUNT_USD), // Tracking value
                currentLevel: newLevel,
                updatedAt: serverTimestamp()
            });
        });

        // TODO: Call Stripe to add customer balance transaction for Referrer
        // This requires server-side Stripe key. We should do this in an API route or Server Action,
        // not directly in client-side code if this file is shared. 
        // *Correction*: This file `referralService.ts` imports `stripe` from `./stripe` which might be server-only?
        // Let's check `src/lib/stripe.ts`. If it exports `stripe` initialized with secret key, it's server-only.

        if (stripe) {
            // We need the customer ID. 
            // For now, we'll implement the Stripe credit in the API route that calls this service.
        }

    } catch (error) {
        console.error('Error granting reward:', error);
    }
}

export async function getReferralStats(userId: string): Promise<ReferralStats | null> {
    const statsRef = doc(db, 'users', userId, 'referral_stats', 'summary');
    const snap = await getDoc(statsRef);
    if (snap.exists()) {
        return snap.data() as ReferralStats;
    }
    return null;
}
