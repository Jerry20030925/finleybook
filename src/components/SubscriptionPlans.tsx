'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckIcon, SparklesIcon, StarIcon } from '@heroicons/react/24/outline'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'
import { getStripe } from '@/lib/stripe'
import toast from 'react-hot-toast'

import { useAuth } from '@/components/AuthProvider'

interface SubscriptionPlansProps {
  currentPlan?: SubscriptionPlan
  onClose?: () => void
}

export default function SubscriptionPlans({ currentPlan = 'FREE', onClose }: SubscriptionPlansProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState<SubscriptionPlan | null>(null)
  const [billingInterval, setBillingInterval] = useState<'month' | 'year'>('year')

  const handleSubscribe = async (planKey: SubscriptionPlan) => {
    if (planKey === 'FREE') {
      toast.success('您已在使用免费版！')
      return
    }

    if (!user) {
      toast.error('请先登录')
      return
    }

    setLoading(planKey)

    try {
      // Create checkout session
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planKey,
          successUrl: `${window.location.origin}/dashboard?success=true`,
          cancelUrl: window.location.href,
          userId: user.uid,
          email: user.email,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        console.error('API Error:', data)

        // Handle specific error types
        if (data.details?.includes('Price ID')) {
          toast.error(`订阅配置错误: ${data.details}`)
        } else if (data.details?.includes('Stripe not properly configured')) {
          toast.error('支付系统配置错误，请联系管理员')
        } else if (data.details?.includes('User authentication required')) {
          toast.error('请重新登录后再试')
        } else {
          toast.error(data.error || '订阅失败，请重试')
          console.error('Detailed error:', data.details)
        }
        return
      }

      const { sessionId, url } = data

      if (!sessionId && !url) {
        throw new Error('No checkout session created')
      }

      // Redirect to Stripe Checkout
      if (url) {
        window.location.href = url
      } else if (sessionId) {
        window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
      }
    } catch (error: any) {
      console.error('Subscription error:', error)

      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        toast.error('网络连接失败，请检查网络后重试')
      } else {
        toast.error(error.message || '订阅失败，请重试')
      }
    } finally {
      setLoading(null)
    }
  }

  const getDisplayPlans = () => {
    const plans = [SUBSCRIPTION_PLANS.FREE] as any[]

    if (billingInterval === 'month') {
      plans.push(SUBSCRIPTION_PLANS.PRO_MONTHLY)
    } else {
      plans.push(SUBSCRIPTION_PLANS.PRO_YEARLY)
    }

    return plans
  }

  const formatPrice = (price: number, interval: string) => {
    const dollars = (price / 100).toFixed(2)
    return `$${dollars}/${interval === 'month' ? '月' : '年'}`
  }

  return (
    <div className="py-12 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            选择最适合您的方案
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            从免费版开始，随时升级到 Pro 版本解锁全部功能
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingInterval === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
              月付
            </span>
            <motion.button
              className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 bg-blue-600"
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                className="pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform ring-0 transition duration-200 ease-in-out"
                animate={{ x: billingInterval === 'year' ? 20 : 0 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </motion.button>
            <span className={`text-sm font-medium ${billingInterval === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
              年付
            </span>
            {billingInterval === 'year' && (
              <motion.span
                className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              >
                节省 33%
              </motion.span>
            )}
          </div>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 max-w-4xl mx-auto">
          {getDisplayPlans().map((plan, index) => {
            const planKey = index === 0 ? 'FREE' : (billingInterval === 'month' ? 'PRO_MONTHLY' : 'PRO_YEARLY') as SubscriptionPlan
            const isPopular = planKey !== 'FREE'
            const isCurrentPlan = currentPlan === planKey
            const isLoading = loading === planKey

            return (
              <motion.div
                key={planKey}
                className={`relative rounded-2xl border-2 p-8 shadow-lg ${isPopular
                  ? 'border-blue-500 bg-white shadow-blue-500/25'
                  : 'border-gray-200 bg-white'
                  }`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                whileHover={{ y: -4, shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)' }}
              >
                {isPopular && (
                  <motion.div
                    className="absolute -top-4 left-1/2 transform -translate-x-1/2"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.2, type: 'spring' }}
                  >
                    <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                      <StarIcon className="w-4 h-4 mr-1" />
                      推荐方案
                    </span>
                  </motion.div>
                )}

                <div className="text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h2>

                  {planKey === 'FREE' ? (
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">免费</span>
                    </div>
                  ) : (
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-gray-900">
                        {formatPrice(plan.price, plan.interval)}
                      </span>
                      {plan.discount && (
                        <div className="text-sm text-green-600 font-medium mt-1">
                          {plan.discount}
                        </div>
                      )}
                    </div>
                  )}

                  {isCurrentPlan && (
                    <motion.div
                      className="mb-6"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring' }}
                    >
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                        <CheckIcon className="w-4 h-4 mr-1" />
                        当前方案
                      </span>
                    </motion.div>
                  )}

                  <motion.button
                    onClick={() => handleSubscribe(planKey)}
                    disabled={isCurrentPlan || isLoading}
                    className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-200 ${isPopular
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg'
                      : 'bg-gray-600 hover:bg-gray-700'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    whileHover={!isCurrentPlan && !isLoading ? { scale: 1.05 } : {}}
                    whileTap={!isCurrentPlan && !isLoading ? { scale: 0.95 } : {}}
                  >
                    {isLoading ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        处理中...
                      </div>
                    ) : isCurrentPlan ? (
                      '当前方案'
                    ) : planKey === 'FREE' ? (
                      '开始使用'
                    ) : (
                      '立即升级'
                    )}
                  </motion.button>
                </div>

                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-blue-600" />
                    功能特性
                  </h3>
                  <ul className="space-y-3">
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <motion.li
                        key={featureIndex}
                        className="flex items-start"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 + featureIndex * 0.05 + 0.3 }}
                      >
                        <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* FAQ or Additional Info */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.6 }}
        >
          <p className="text-gray-600 text-sm">
            所有付费方案都支持随时取消订阅。有问题？
            <a href="mailto:support@finleybook.com" className="text-blue-600 hover:text-blue-700 ml-1">
              联系客服
            </a>
          </p>
        </motion.div>

        {onClose && (
          <motion.div
            className="fixed top-4 right-4"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
          >
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-white shadow-lg text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </motion.div>
        )}
      </div>
    </div>
  )
}