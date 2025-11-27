'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useState } from 'react'
import { Check, Shield, Zap, Lock, TrendingUp, X, Sparkles } from 'lucide-react'
import { useAuth } from './AuthProvider'

interface SubscriptionPageProps {
    onClose?: () => void
}

export default function SubscriptionPage({ onClose }: SubscriptionPageProps) {
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly')
    const [isProcessing, setIsProcessing] = useState(false)
    const { user } = useAuth()

    const pricing = {
        monthly: {
            price: 9.99,
            total: 9.99,
            perDay: 0.33,
            savings: 0,
            label: 'Monthly',
            monthlyEquivalent: 9.99
        },
        yearly: {
            price: 79.99,
            total: 79.99,
            perDay: 0.22,
            savings: 39.89, // 33% off
            label: 'Yearly',
            monthlyEquivalent: 6.67
        }
    }

    const current = pricing[billingCycle]

    const proFeatures = [
        {
            icon: Shield,
            title: 'iCloud Encrypted Backup',
            description: 'Zero-knowledge encryption (换手机数据不丢)',
            benefit: 'Your data, your control'
        },
        {
            icon: Zap,
            title: 'Lock Screen Widget',
            description: 'Record expenses without opening app (锁屏界面就能记账)',
            benefit: 'Faster than bank sync'
        },
        {
            icon: TrendingUp,
            title: 'Life-Hour Calculator',
            description: 'Convert prices to work hours (看清每笔消费的真实代价)',
            benefit: 'Make smarter decisions'
        },
        {
            icon: Sparkles,
            title: 'AI Alternative Finder',
            description: 'Paste product link, get cheaper options (全网找低价)',
            benefit: 'Save $450+ per year'
        },
        {
            icon: Lock,
            title: 'Camouflage Mode',
            description: 'Shake to hide as calculator (摇一摇隐藏界面)',
            benefit: 'Ultimate privacy'
        },
        {
            icon: Check,
            title: 'Unlimited Wishlist',
            description: 'Desire cooling + price tracking (欲望冷却+降价提醒)',
            benefit: 'Beat impulse buying'
        }
    ]

    const handleSubscribe = async () => {
        if (!user) {
            alert('Please login first to subscribe')
            return
        }

        setIsProcessing(true)

        try {
            // Actual Stripe Price IDs from environment variables
            const priceIds = {
                monthly: 'price_1QQVSzDBM183Xrjp3UQ5hgQB',
                yearly: 'price_1QQVTgDBM183XrjSSKsR2Xqj'
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
            alert(`Failed to start subscription: ${error.message}`)
            setIsProcessing(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 p-4 md:p-8">
            {/* Close button */}
            {onClose && (
                <button
                    onClick={onClose}
                    className="fixed top-4 right-4 p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors z-50"
                >
                    <X size={24} />
                </button>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header - Value Statement */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12"
                >
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2, type: 'spring' }}
                        className="inline-block mb-4"
                    >
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white px-6 py-2 rounded-full font-bold text-sm">
                            🔥 Limited Time: Save 33%
                        </div>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        别让隐形消费偷走你的积蓄
                    </h1>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        FinleyBook Pro 不是一笔开销，<br />
                        它是你财富的<span className="text-indigo-600 font-bold">防火墙</span>。
                    </p>

                    {/* ROI Highlight */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 inline-block bg-green-50 border-2 border-green-200 rounded-2xl px-8 py-4"
                    >
                        <div className="text-sm text-green-600 font-medium mb-1">Average User Savings</div>
                        <div className="text-3xl font-bold text-green-700">$450+ / year</div>
                        <div className="text-xs text-green-600 mt-1">通过AI找平替 + 欲望冷却</div>
                    </motion.div>
                </motion.div>

                {/* Billing Toggle */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex justify-center mb-8"
                >
                    <div className="bg-white rounded-full p-2 shadow-lg">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-8 py-3 rounded-full font-bold transition-all ${billingCycle === 'monthly'
                                ? 'bg-indigo-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-8 py-3 rounded-full font-bold transition-all relative ${billingCycle === 'yearly'
                                ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white'
                                : 'text-gray-600 hover:text-gray-900'
                                }`}
                        >
                            Yearly
                            {billingCycle === 'yearly' && (
                                <span className="absolute -top-2 -right-2 bg-yellow-400 text-xs px-2 py-1 rounded-full font-bold">
                                    -33%
                                </span>
                            )}
                        </button>
                    </div>
                </motion.div>

                {/* Dynamic Messaging */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={billingCycle}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="text-center mb-8"
                    >
                        {billingCycle === 'monthly' ? (
                            <p className="text-lg text-gray-700">
                                ☕️ 少喝<span className="font-bold text-indigo-600">两杯咖啡</span>，多存一笔巨款
                            </p>
                        ) : (
                            <p className="text-lg text-gray-700">
                                💰 相当于每天仅需 <span className="text-3xl font-bold text-green-600">${current.perDay}</span>
                            </p>
                        )}
                    </motion.div>
                </AnimatePresence>

                {/* Pricing Card */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 }}
                    className="max-w-2xl mx-auto mb-12"
                >
                    <div className={`relative rounded-3xl p-8 ${billingCycle === 'yearly'
                        ? 'bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500'
                        : 'bg-white border-2 border-gray-200'
                        }`}>
                        {/* Glow effect for yearly */}
                        {billingCycle === 'yearly' && (
                            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 blur-2xl opacity-50 -z-10" />
                        )}

                        <div className={billingCycle === 'yearly' ? 'text-white' : 'text-gray-900'}>
                            {/* Badge */}
                            {billingCycle === 'yearly' && (
                                <div className="inline-block bg-yellow-400 text-gray-900 px-4 py-1 rounded-full font-bold text-sm mb-4">
                                    ⭐ Best Value
                                </div>
                            )}

                            {/* Price */}
                            <div className="mb-6">
                                <div className="flex items-baseline gap-2">
                                    <span className="text-5xl font-bold">${current.price}</span>
                                    <span className="text-xl opacity-80">/ {current.label.toLowerCase()}</span>
                                </div>
                                {billingCycle === 'yearly' && (
                                    <div className="mt-2 text-sm opacity-90">
                                        = ${current.monthlyEquivalent}/month · Save ${current.savings}
                                    </div>
                                )}
                            </div>

                            {/* CTA Button */}
                            <button
                                onClick={handleSubscribe}
                                disabled={isProcessing}
                                className={`w-full py-4 rounded-xl font-bold text-lg transition-all mb-4 ${billingCycle === 'yearly'
                                    ? 'bg-white text-indigo-600 hover:bg-gray-100'
                                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                    } disabled:opacity-50`}
                            >
                                {isProcessing ? 'Processing...' : 'Start Saving Money'}
                            </button>

                            {/* Guarantees */}
                            <div className={`text-sm text-center space-y-2 ${billingCycle === 'yearly' ? 'opacity-90' : 'text-gray-600'
                                }`}>
                                <div>✅ 7-day money-back guarantee</div>
                                <div>✅ Cancel anytime in 1-click</div>
                                <div>✅ No hidden fees</div>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Features Grid */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="mb-12"
                >
                    <h2 className="text-2xl font-bold text-center mb-8">What You Get</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {proFeatures.map((feature, index) => (
                            <motion.div
                                key={feature.title}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.6 + index * 0.1 }}
                                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow"
                            >
                                <div className="flex items-start gap-4">
                                    <div className="p-3 bg-indigo-100 rounded-xl">
                                        <feature.icon className="text-indigo-600" size={24} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-gray-900 mb-1">{feature.title}</h3>
                                        <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                                        <div className="text-xs text-indigo-600 font-medium">
                                            → {feature.benefit}
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </motion.div>

                {/* FAQ / Trust Builders */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="max-w-2xl mx-auto text-center"
                >
                    <div className="bg-white rounded-2xl p-8 shadow-lg">
                        <h3 className="text-xl font-bold mb-4">常见问题</h3>
                        <div className="space-y-4 text-left">
                            <div>
                                <div className="font-bold text-gray-900 mb-1">如何取消订阅？</div>
                                <div className="text-sm text-gray-600">
                                    随时在个人主页点击"取消订阅"，没有任何隐藏门槛。1秒完成。
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-1">如果不满意怎么办？</div>
                                <div className="text-sm text-gray-600">
                                    7天内全额退款，无需理由。我们对产品有信心。
                                </div>
                            </div>
                            <div>
                                <div className="font-bold text-gray-900 mb-1">数据安全吗？</div>
                                <div className="text-sm text-gray-600">
                                    零知识加密。连我们都无法读取你的数据。100%隐私保证。
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}
