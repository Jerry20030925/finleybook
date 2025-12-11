'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Check, Shield, Zap, Lock, TrendingUp, X, Sparkles, Star, MessageCircle, Clock, ArrowRight } from 'lucide-react'
import { useAuth } from './AuthProvider'
import { useLanguage } from './LanguageProvider'
import { useCurrency } from './CurrencyProvider'

interface SubscriptionPageProps {
    onClose?: () => void
}

export default function SubscriptionPage({ onClose }: SubscriptionPageProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
    const [isProcessing, setIsProcessing] = useState(false)
    const { user } = useAuth()
    const { t, language } = useLanguage()
    const { country } = useCurrency()

    const pricing = {
        monthly: {
            price: 9.99,
            total: 9.99,
            perDay: 0.33,
            savings: 0,
            label: t('subscription.monthly'),
            monthlyEquivalent: 9.99
        },
        yearly: {
            price: 79.99,
            total: 79.99,
            perDay: 0.22,
            savings: 39.89, // 33% off
            label: t('subscription.yearly'),
            monthlyEquivalent: 6.67
        }
    }

    const current = pricing[billingCycle]

    const proFeatures = [
        {
            icon: Shield,
            title: t('subscription.features.icloud.title'),
            description: t('subscription.features.icloud.desc'),
            benefit: t('subscription.features.icloud.benefit')
        },
        {
            icon: Zap,
            title: t('subscription.features.widget.title'),
            description: t('subscription.features.widget.desc'),
            benefit: t('subscription.features.widget.benefit')
        },
        {
            icon: TrendingUp,
            title: t('subscription.features.lifehour.title'),
            description: t('subscription.features.lifehour.desc'),
            benefit: t('subscription.features.lifehour.benefit')
        },
        {
            icon: Sparkles,
            title: t('subscription.features.ai.title'),
            description: t('subscription.features.ai.desc'),
            benefit: t('subscription.features.ai.benefit')
        },
        {
            icon: Lock,
            title: t('subscription.features.camo.title'),
            description: t('subscription.features.camo.desc'),
            benefit: t('subscription.features.camo.benefit')
        },
        {
            icon: Check,
            title: t('subscription.features.wishlist.title'),
            description: t('subscription.features.wishlist.desc'),
            benefit: t('subscription.features.wishlist.benefit')
        },
        {
            icon: TrendingUp,
            title: t('subscription.features.cashback.title'),
            description: t('subscription.features.cashback.desc'),
            benefit: t('subscription.features.cashback.benefit')
        }
    ]

    const testimonials = [
        {
            text: t('subscription.testimonial.1.text'),
            author: t('subscription.testimonial.1.author'),
            rating: 5
        },
        {
            text: t('subscription.testimonial.2.text'),
            author: t('subscription.testimonial.2.author'),
            rating: 5
        },
        {
            text: t('subscription.testimonial.3.text'),
            author: t('subscription.testimonial.3.author'),
            rating: 5
        }
    ]

    const handleSubscribe = async () => {
        if (!user) {
            alert(t('auth.loginRequired') || 'Please login first')
            return
        }

        setIsProcessing(true)

        try {
            // Actual Stripe Price IDs from environment variables or fallbacks
            const priceIds = {
                monthly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MONTHLY || 'price_1SWsXIDBM183XrjL5aFQQeiJ',
                yearly: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_YEARLY || 'price_1SWsy2DBM183XrjL9RJ4F95Z'
            }

            const priceId = priceIds[billingCycle]

            // Call our API to create checkout session
            const response = await fetch('/api/stripe/checkout', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    priceId,
                    userId: user.uid,
                }),
            })

            const data = await response.json()

            if (data.error) {
                throw new Error(data.error)
            }

            // Redirect to Stripe Checkout
            if (data.url) {
                window.location.href = data.url
            }
        } catch (error: any) {
            console.error('Subscription error:', error)
            alert(`${t('common.error')}: ${error.message}`)
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8 overflow-y-auto">
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-50 shadow-sm"
                >
                    <X size={24} className="text-gray-600" />
                </button>
            )}

            <div className="max-w-5xl mx-auto pb-20">
                {/* Header - Value Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 pt-8"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-block mb-6"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-sm shadow-lg flex items-center gap-2">
                            <Sparkles size={16} />
                            {t('subscription.limitedTime')}
                        </div>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                        {t('subscription.title')}
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        {t('subscription.subtitle')}<br />
                        <span className="text-indigo-600 font-bold">{t('subscription.subtitle.highlight')}</span>
                    </p>

                    {/* ROI Highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 inline-flex items-center gap-4 bg-white border border-green-100 rounded-2xl px-8 py-4 shadow-xl shadow-green-100/50"
                    >
                        <div className="bg-green-100 p-3 rounded-xl">
                            <TrendingUp className="text-green-600" size={24} />
                        </div>
                        <div className="text-left">
                            <div className="text-sm text-green-600 font-medium">{t('subscription.averageSavings')}</div>
                            <div className="text-2xl font-bold text-green-700">{t('subscription.savingsAmount')}</div>
                        </div>
                    </motion.div>
                </motion.div>

                {/* Comparison Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-16 bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100"
                >
                    <div className="p-6 md:p-8 bg-gray-50 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-center text-gray-900">{t('subscription.compare.title')}</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-gray-100">
                                    <th className="py-4 px-6 text-left text-sm font-medium text-gray-500 w-1/3">{t('subscription.compare.feature')}</th>
                                    <th className="py-4 px-6 text-center text-sm font-medium text-gray-500 w-1/3">{t('subscription.compare.free')}</th>
                                    <th className="py-4 px-6 text-center text-sm font-bold text-indigo-600 w-1/3 bg-indigo-50/30">{t('subscription.compare.pro')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[
                                    { key: 'cashback', icon: TrendingUp },
                                    { key: 'withdraw', icon: Zap },
                                    { key: 'ai', icon: Sparkles },
                                    { key: 'wishlist', icon: Check },
                                    { key: 'privacy', icon: Lock },
                                    { key: 'support', icon: MessageCircle }
                                ].map((item) => (
                                    <tr key={item.key} className="hover:bg-gray-50 transition-colors">
                                        <td className="py-4 px-6 text-sm font-medium text-gray-900 flex items-center gap-2">
                                            <item.icon size={16} className="text-gray-400" />
                                            {t(`subscription.compare.${item.key}`)}
                                        </td>
                                        <td className="py-4 px-6 text-center text-sm text-gray-600">
                                            {t(`subscription.compare.${item.key}.free`)}
                                        </td>
                                        <td className="py-4 px-6 text-center text-sm font-bold text-indigo-600 bg-indigo-50/30">
                                            {t(`subscription.compare.${item.key}.pro`)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Pricing Section */}
                <div className="grid md:grid-cols-2 gap-8 items-center mb-16">
                    {/* Billing Toggle & Message */}
                    <div className="text-center md:text-left">
                        <h3 className="text-2xl font-bold text-gray-900 mb-6">
                            {t('subscription.startSaving')}
                        </h3>

                        <div className="inline-flex bg-white rounded-full p-1 shadow-md mb-6 border border-gray-100">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full font-bold transition-all ${billingCycle === 'monthly'
                                    ? 'bg-gray-900 text-white'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {t('subscription.monthly')}
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full font-bold transition-all relative ${billingCycle === 'yearly'
                                    ? 'bg-indigo-600 text-white shadow-lg'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {t('subscription.yearly')}
                                {billingCycle === 'yearly' && (
                                    <span className="absolute -top-3 -right-3 bg-yellow-400 text-gray-900 text-[10px] px-2 py-0.5 rounded-full font-bold shadow-sm border border-white">
                                        {t('subscription.yearlyDiscount')}
                                    </span>
                                )}
                            </button>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={billingCycle}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="text-lg text-gray-600 mb-4"
                            >
                                {billingCycle === 'monthly' ? (
                                    <p dangerouslySetInnerHTML={{ __html: t('subscription.monthlyMsg') }} />
                                ) : (
                                    <p dangerouslySetInnerHTML={{ __html: t('subscription.yearlyMsg', { amount: current.perDay }) }} />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Pricing Card */}
                    <motion.div
                        whileHover={{ y: -5 }}
                        className={`relative rounded-3xl p-8 ${billingCycle === 'yearly'
                            ? 'bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 text-white shadow-2xl shadow-indigo-200'
                            : 'bg-white border-2 border-gray-100 text-gray-900 shadow-xl'
                            }`}
                    >
                        {billingCycle === 'yearly' && (
                            <div className="absolute top-0 right-0 bg-yellow-400 text-gray-900 px-4 py-1 rounded-bl-2xl rounded-tr-2xl font-bold text-sm">
                                {t('subscription.bestValue')}
                            </div>
                        )}

                        <div className="mb-8">
                            <div className="flex items-baseline gap-1">
                                <span className="text-5xl font-extrabold tracking-tight">{country.symbol}{current.price}</span>
                                <span className="text-lg opacity-80">{t('subscription.perMonth')}</span>
                            </div>
                            {billingCycle === 'yearly' && (
                                <div className="mt-2 text-sm opacity-90 font-medium bg-white/20 inline-block px-3 py-1 rounded-full">
                                    = {country.symbol}{current.monthlyEquivalent}{t('subscription.perMonth')} · {t('subscription.save')} {country.symbol}{current.savings}
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleSubscribe}
                            disabled={isProcessing}
                            className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-6 flex items-center justify-center gap-2 ${billingCycle === 'yearly'
                                ? 'bg-white text-indigo-600 hover:bg-gray-50 shadow-lg'
                                : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-200'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isProcessing ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                                    {t('subscription.processing')}
                                </>
                            ) : (
                                <>
                                    {t('subscription.startSaving')}
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className={`text-xs text-center space-y-1.5 ${billingCycle === 'yearly' ? 'opacity-80' : 'text-gray-500'
                            }`}>
                            <div className="flex items-center justify-center gap-1.5">
                                <Shield size={12} />
                                {t('subscription.guarantee.7day')}
                            </div>
                            <div className="flex items-center justify-center gap-1.5">
                                <Clock size={12} />
                                {t('subscription.guarantee.cancel')}
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Testimonials */}
                <div className="mb-16">
                    <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">{t('subscription.testimonials.title')}</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + index * 0.1 }}
                                className="bg-white p-6 rounded-2xl shadow-lg border border-gray-50"
                            >
                                <div className="flex gap-1 text-yellow-400 mb-3">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} size={16} fill="currentColor" />
                                    ))}
                                </div>
                                <p className="text-gray-600 mb-4 text-sm leading-relaxed">"{testimonial.text}"</p>
                                <div className="font-bold text-gray-900 text-sm flex items-center gap-2">
                                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-xs">
                                        {testimonial.author.charAt(0)}
                                    </div>
                                    {testimonial.author}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* FAQ / Trust Builders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                        <h3 className="text-xl font-bold mb-6 text-center">{t('subscription.faq')}</h3>
                        <div className="space-y-6">
                            <div className="flex gap-4">
                                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                                    <X size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">{t('subscription.faq.cancel.q')}</div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {t('subscription.faq.cancel.a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                                    <Shield size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">{t('subscription.faq.satisfaction.q')}</div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {t('subscription.faq.satisfaction.a')}
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="bg-indigo-50 p-2 rounded-lg h-fit">
                                    <Lock size={20} className="text-indigo-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-gray-900 mb-1">{t('subscription.faq.security.q')}</div>
                                    <div className="text-sm text-gray-600 leading-relaxed">
                                        {t('subscription.faq.security.a')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
