'use client'

import { useState, useEffect } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useLanguage } from '@/components/LanguageProvider';
import { useRouter } from 'next/navigation';
// import useSound from 'use-sound'; // Sound file missing, disabled for production
import { TrendingUp, Zap, ArrowRight } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, orderBy, limit, doc } from 'firebase/firestore';
import Skeleton from '@/components/Skeleton';

export default function WalletPage() {
    const { user, loading: authLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();
    const [balance, setBalance] = useState({ available: 0, pending: 0, lifetime: 0 });
    const [stripeStatus, setStripeStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    // const [playCashRegister] = useSound('/sounds/cash-register.mp3');



    const [transactions, setTransactions] = useState<any[]>([]);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/');
        }
    }, [authLoading, user, router]);

    useEffect(() => {
        if (!user) {
            if (!authLoading) setLoading(false);
            return;
        }

        // 1. Listen to User Wallet Balance
        const userUnsub = onSnapshot(doc(db, 'users', user.uid), (doc) => {
            if (doc.exists()) {
                const data = doc.data();
                // Use wallet_snapshot if available, otherwise fallback to wallet
                const walletData = data.wallet_snapshot ? {
                    available: data.wallet_snapshot.available_balance || 0,
                    pending: data.wallet_snapshot.pending_balance || 0,
                    lifetime: data.wallet_snapshot.lifetime_earnings || 0
                } : (data.wallet || { available: 0, pending: 0, lifetime: 0 });

                setBalance(walletData);
                setStripeStatus(data.stripeAccountStatus || null);
            } else {
                // Initialize empty balance if user document doesn't exist
                setBalance({ available: 0, pending: 0, lifetime: 0 });
            }
        });

        // 2. Listen to Real Transactions Only (filter out mock data)
        const q = query(
            collection(db, 'transactions'),
            where('userId', '==', user.uid),
            orderBy('date', 'desc'),
            limit(20)
        );

        const txUnsub = onSnapshot(q, (snapshot) => {
            // Filter out any test/mock transactions
            const txs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
                .filter((tx: any) => {
                    // Filter out transactions that look like test data
                    return tx.merchantName &&
                        !tx.merchantName.includes('Test') &&
                        !tx.merchantName.includes('Mock') &&
                        tx.amount !== undefined;
                });
            setTransactions(txs);
            setLoading(false);
        });

        return () => {
            userUnsub();
            txUnsub();
        };
    }, [user]);

    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectStripe = async () => {
        try {
            if (!user) {
                toast.error(t('auth.loginRequired'));
                return;
            }

            setIsConnecting(true);
            const toastId = toast.loading(t('wallet.stripe.connecting'));
            const token = await user.getIdToken();

            const response = await fetch('/api/stripe/onboarding', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (data.url) {
                toast.success(t('wallet.stripe.redirecting'), { id: toastId });
                window.location.href = data.url;
            } else {
                console.error('Stripe Connect error:', data.error);
                toast.error(data.error || t('wallet.stripe.error'), { id: toastId });
                setIsConnecting(false);
            }
        } catch (error: any) {
            console.error('Error connecting Stripe:', error);
            toast.error(error.message || t('wallet.stripe.error'));
            setIsConnecting(false);
        }
    };

    const handleWithdraw = async () => {
        if (balance.available < 1) {
            toast.error(t('wallet.withdraw.minAmount'));
            return;
        }

        const toastId = toast.loading('Processing withdrawal...');
        try {
            const token = await user?.getIdToken();
            const response = await fetch('/api/payout', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const data = await response.json();

            if (response.ok) {
                toast.success(t('wallet.withdraw.success'), { id: toastId });
                // playCashRegister();
            } else {
                toast.error(data.error || 'Withdrawal failed', { id: toastId });
            }
        } catch (error) {
            toast.error('Network error', { id: toastId });
        }
    };

    // ... imports

    if (loading) return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24 space-y-8">
            <Skeleton className="h-32 w-full rounded-xl" />
            <div className="flex justify-between items-end">
                <Skeleton className="h-20 w-40" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
                <Skeleton className="h-48 rounded-xl" />
            </div>
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="space-y-4">
                <Skeleton className="h-8 w-40" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
                <Skeleton className="h-20 w-full rounded-xl" />
            </div>
        </div>
    );

    return (
        <div className="max-w-4xl mx-auto px-4 py-8 pb-24">

            {/* Pro Banner */}
            <div className="mb-8 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl p-4 text-white flex items-center justify-between shadow-lg relative overflow-hidden group cursor-pointer" onClick={() => router.push('/subscribe')}>
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none" />
                <div className="relative z-10 flex items-center gap-3">
                    <div className="bg-white/20 p-2 rounded-lg backdrop-blur-sm">
                        <Zap className="text-yellow-300" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-lg">{t('wallet.proBanner.title')}</h3>
                        <p className="text-purple-100 text-sm">{t('wallet.proBanner.desc')}</p>
                    </div>
                </div>
                <div className="relative z-10 hidden sm:flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg font-bold text-sm hover:bg-white/30 transition-colors">
                    {t('wallet.proBanner.cta')} <ArrowRight size={16} />
                </div>
            </div>

            <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                    <h1 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-1">{t('wallet.earned.title')}</h1>
                    <div className="flex items-center gap-3">
                        <span className="text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            ${(balance.lifetime / 100).toFixed(2)}
                        </span>
                        <span className="text-4xl">🚀</span>
                    </div>
                    <p className="mt-2 text-gray-600 dark:text-gray-400 flex items-center gap-1">
                        {balance.available < 1 ? (
                            <span className="text-green-600 font-bold">You're only $0.01 away from your first withdrawal!</span>
                        ) : (
                            <span dangerouslySetInnerHTML={{ __html: t('wallet.earned.desc', { amount: '$95.80' }) }} />
                        )}
                    </p>
                </div>


            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {/* Available Balance -> Cash Out Now */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-20 h-20 bg-green-50 rounded-full blur-2xl -mr-10 -mt-10" />
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('wallet.cashOut.title')}</h3>
                    <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
                        ${(balance.available / 100).toFixed(2)}
                    </p>
                    <button
                        onClick={handleWithdraw}
                        className={`mt-4 w-full py-3 px-4 rounded-xl text-sm font-bold shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2 ${balance.available > 0
                            ? 'bg-green-500 hover:bg-green-400 text-white shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-pulse'
                            : 'bg-gray-800 text-gray-400 border border-gray-700'
                            }`}
                    >
                        {t('wallet.withdraw')}
                    </button>
                    <div className="mt-3 flex items-center justify-center gap-3 opacity-60 grayscale hover:grayscale-0 transition-all">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-4" />
                        <div className="h-3 w-px bg-gray-300"></div>
                        <span className="text-[10px] text-gray-400 font-medium">Instant Payouts</span>
                    </div>
                </div>

                {/* Pending Balance -> On the way */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{t('wallet.pending.title')}</h3>
                    <p className="mt-2 text-3xl font-black text-gray-900 dark:text-white">
                        ${(balance.pending / 100).toFixed(2)}
                    </p>
                    <div className="mt-4">
                        <div className="flex justify-between text-xs text-gray-500 mb-2">
                            <span>Est. Arrival</span>
                            <span className="font-bold text-green-600">
                                {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <div className="flex gap-1.5">
                            <div className="h-1.5 flex-1 bg-green-500 rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                            <div className="h-1.5 flex-1 bg-green-500/30 rounded-full" />
                            <div className="h-1.5 flex-1 bg-gray-200 dark:bg-gray-700 rounded-full" />
                        </div>
                        <div className="flex justify-between text-[10px] text-gray-400 mt-1.5 font-medium">
                            <span>{t('wallet.pending.status.pending')}</span>
                            <span>{t('wallet.pending.status.approved')}</span>
                            <span>{t('wallet.pending.status.ready')}</span>
                        </div>
                    </div>
                </div>

                {/* Lifetime Earnings -> Total Earned */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mb-10" />
                    <h3 className="text-sm font-bold text-indigo-200 uppercase tracking-wider">{t('wallet.totalEarned.title')}</h3>
                    <p className="mt-2 text-3xl font-black text-white">
                        ${(balance.lifetime / 100).toFixed(2)}
                    </p>
                    <div className="mt-4 bg-white/10 rounded-lg p-2 text-xs text-indigo-100 backdrop-blur-sm border border-white/10 flex items-center gap-2">
                        <div className="text-2xl">
                            {balance.lifetime > 100000 ? '🥇' : balance.lifetime > 10000 ? '🥈' : '🥉'}
                        </div>
                        <div>
                            <p className="font-bold text-white">
                                {balance.lifetime > 100000 ? t('wallet.status.level.gold') : balance.lifetime > 10000 ? t('wallet.status.level.silver') : t('wallet.status.level.bronze')}
                            </p>
                            <p className="opacity-80">{t('wallet.status.keepEarning')}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Payout Settings */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden mb-8">
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                    <h2 className="text-lg font-medium text-gray-900 dark:text-white">{t('wallet.payout.title')}</h2>
                </div>
                <div className="p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-sm font-medium text-gray-900 dark:text-white">{t('wallet.stripe.title')}</h3>
                                {stripeStatus && (
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${stripeStatus.payoutsEnabled
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {stripeStatus.payoutsEnabled ? 'ACTIVE' : 'RESTRICTED'}
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {stripeStatus?.payoutsEnabled
                                    ? 'Your account is active and ready to receive payouts.'
                                    : stripeStatus
                                        ? 'Action required: Please complete your account setup to enable payouts.'
                                        : t('wallet.stripe.desc')}
                            </p>
                        </div>
                        <button
                            onClick={handleConnectStripe}
                            disabled={isConnecting}
                            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${stripeStatus && !stripeStatus.payoutsEnabled
                                ? 'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                                : 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            {isConnecting
                                ? t('common.loading')
                                : stripeStatus?.payoutsEnabled
                                    ? 'Manage Account'
                                    : stripeStatus
                                        ? 'Complete Setup'
                                        : t('wallet.stripe.connect')}
                        </button>
                    </div>
                </div>
            </div>



            {/* Transaction History */}
            <div className="mt-8">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">{t('wallet.history.title')}</h2>

                {transactions.length > 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                        {transactions.map((tx) => {
                            // Handle different date formats
                            let txDate;
                            if (tx.date?.seconds) {
                                txDate = new Date(tx.date.seconds * 1000);
                            } else if (tx.date?.toDate) {
                                txDate = tx.date.toDate();
                            } else if (tx.date) {
                                txDate = new Date(tx.date);
                            } else {
                                txDate = new Date();
                            }

                            // Handle different amount formats (cents vs dollars)
                            const amount = typeof tx.amount === 'number' ?
                                (tx.amount > 1000 ? tx.amount / 100 : tx.amount) :
                                parseFloat(tx.amount) || 0;

                            return (
                                <div key={tx.id} className="p-4 border-b border-gray-100 dark:border-gray-700 last:border-0 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${(tx.status === 'PENDING' || tx.status === 'PROCESSING') ? 'bg-yellow-100 text-yellow-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            {tx.type === 'cashback' || tx.type === 'commission' ? '🛍️' : '💸'}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-gray-900 dark:text-white">
                                                {tx.merchantName || tx.description || 'Transaction'}
                                            </h4>
                                            <p className="text-xs text-gray-500">
                                                {txDate.toLocaleDateString()} • {tx.status || 'COMPLETED'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={`font-bold ${(tx.type === 'withdrawal' || amount < 0) ? 'text-red-500' : 'text-green-600'
                                            }`}>
                                            {(tx.type === 'withdrawal' || amount < 0) ? '-' : '+'}${Math.abs(amount).toFixed(2)}
                                        </div>
                                        {(tx.status === 'PENDING' || tx.status === 'PROCESSING') && (
                                            <div className="text-[10px] text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full inline-block mt-1">
                                                Processing...
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-8 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
                                🚀
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Transactions Yet</h3>
                            <p className="text-gray-500 dark:text-gray-400 mb-6">
                                Start earning cashback by shopping through our partner merchants. Your transactions will appear here once they're processed.
                            </p>
                            <div className="space-y-3">
                                <p className="text-sm text-gray-500 mb-2">Your next purchase at Amazon could earn you <span className="font-bold text-green-600">$5.00</span>.</p>
                                <button
                                    onClick={() => router.push('/wealth')}
                                    className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors w-full shadow-lg shadow-emerald-600/20"
                                >
                                    Start Earning Now
                                </button>
                                <p className="text-xs text-gray-400">
                                    Tip: Connect to Stripe above to enable instant payouts
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
