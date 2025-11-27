'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckIcon, SparklesIcon, StarIcon, ShieldCheckIcon, ArrowPathIcon } from '@heroicons/react/24/outline'
import { SUBSCRIPTION_PLANS, type SubscriptionPlan } from '@/lib/stripe'
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
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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
        toast.error(data.error || '订阅失败，请重试')
        return
      }

      const { sessionId, url } = data
      if (url) window.location.href = url
      else if (sessionId) window.location.href = `https://checkout.stripe.com/pay/${sessionId}`
    } catch (error: any) {
      toast.error('网络连接失败，请检查网络后重试')
    } finally {
      setLoading(null)
    }
  }

  const getFeatures = (isPro: boolean) => {
    if (!isPro) {
      return [
        '基础记账功能',
        '月度报表',
        '5个预算分类',
        '基础数据导出',
        '社区支持'
      ]
    }
    return [
      '无限记账功能 (记录每一笔财富流动)',
      '全格式数据导出 (方便报税/深度分析)',
      '欲望冷却保险箱 (帮你戒断冲动消费)',
      '高级趋势分析 (洞察隐形浪费)',
      '无限预算分类 (精细化管理每一分钱)',
      '优先客户支持 (专属财富管家)'
    ]
  }

  return (
    <div className="py-12 bg-gradient-to-br from-gray-50 via-white to-blue-50 min-h-screen relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-200/20 rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/20 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header: Value Proposition */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4 tracking-tight">
            别让隐形消费<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">偷走你的积蓄</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            FinleyBook Pro 不是一笔开销，它是你财富的<span className="font-semibold text-gray-900">防火墙</span>。
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-6 mb-8 bg-white/50 backdrop-blur-sm p-2 rounded-full inline-flex mx-auto border border-gray-100 shadow-sm">
            <span className={`text-sm font-medium transition-colors ${billingInterval === 'month' ? 'text-gray-900' : 'text-gray-500'}`}>
              月付
            </span>
            <button
              className={`relative inline-flex h-8 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${billingInterval === 'year' ? 'bg-gradient-to-r from-blue-600 to-purple-600' : 'bg-gray-200'}`}
              onClick={() => setBillingInterval(billingInterval === 'month' ? 'year' : 'month')}
            >
              <span
                className={`pointer-events-none inline-block h-7 w-7 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${billingInterval === 'year' ? 'translate-x-6' : 'translate-x-0'}`}
              />
            </button>
            <div className="flex items-center">
              <span className={`text-sm font-medium transition-colors ${billingInterval === 'year' ? 'text-gray-900' : 'text-gray-500'}`}>
                年付
              </span>
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 animate-pulse">
                省 33%
              </span>
            </div>
          </div>

          {/* Dynamic Pricing Text */}
          <AnimatePresence mode="wait">
            <motion.p
              key={billingInterval}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm font-medium text-blue-600 h-6"
            >
              {billingInterval === 'year'
                ? '✨ 相当于每天仅需 $0.22，比口香糖还便宜'
                : '☕️ 少喝两杯咖啡，多存一笔巨款'}
            </motion.p>
          </AnimatePresence>
        </motion.div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12 max-w-5xl mx-auto">
          {/* Free Plan */}
          <motion.div
            className="relative rounded-3xl border border-gray-200 bg-white/80 backdrop-blur-xl p-8 shadow-xl flex flex-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900">免费版</h2>
              <p className="text-gray-500 mt-2">适合刚刚开始理财的你</p>
            </div>
            <div className="mb-8">
              <span className="text-5xl font-bold text-gray-900">Free</span>
            </div>
            <ul className="space-y-4 mb-8 flex-1">
              {getFeatures(false).map((feature, i) => (
                <li key={i} className="flex items-start">
                  <CheckIcon className="w-5 h-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-600">{feature}</span>
                </li>
              ))}
            </ul>
            <button
              disabled={true}
              className="w-full py-4 px-6 rounded-xl font-semibold text-gray-500 bg-gray-100 cursor-default"
            >
              当前方案
            </button>
          </motion.div>

          {/* Pro Plan */}
          <motion.div
            className="relative rounded-3xl border-2 border-blue-500 bg-white p-8 shadow-2xl shadow-blue-500/20 flex flex-col overflow-hidden"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            {/* Best Value Badge */}
            <div className="absolute top-0 right-0 bg-gradient-to-bl from-blue-600 to-purple-600 text-white text-xs font-bold px-4 py-2 rounded-bl-2xl">
              BEST VALUE
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-2xl font-bold text-gray-900">Pro 专业版</h2>
                <SparklesIcon className="w-6 h-6 text-yellow-500 fill-yellow-500" />
              </div>
              <p className="text-blue-600 font-medium">预计平均每年可为你找回 $450+ 的隐形浪费</p>
            </div>

            <div className="mb-8">
              <div className="flex items-baseline">
                <span className="text-5xl font-bold text-gray-900">
                  {billingInterval === 'year' ? '$79.99' : '$9.99'}
                </span>
                <span className="text-gray-500 ml-2">/{billingInterval === 'year' ? '年' : '月'}</span>
              </div>
              {billingInterval === 'year' && (
                <p className="text-green-600 text-sm font-semibold mt-2 flex items-center">
                  <ArrowPathIcon className="w-4 h-4 mr-1" />
                  30天无理由全额退款承诺
                </p>
              )}
            </div>

            <ul className="space-y-4 mb-8 flex-1">
              {getFeatures(true).map((feature, i) => (
                <li key={i} className="flex items-start">
                  <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                    <CheckIcon className="w-3 h-3 text-blue-600" />
                  </div>
                  <span className="text-gray-700 font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <motion.button
              onClick={() => handleSubscribe(billingInterval === 'year' ? 'PRO_YEARLY' : 'PRO_MONTHLY')}
              disabled={loading !== null}
              className="w-full py-4 px-6 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg shadow-blue-500/30 transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  处理中...
                </div>
              ) : (
                '立即升级 - 开启财富增值'
              )}
            </motion.button>

            <p className="text-center text-xs text-gray-400 mt-4">
              随时在个人主页取消，没有任何隐藏门槛 • 1秒极速处理
            </p>
          </motion.div>
        </div>

        {onClose && (
          <motion.button
            onClick={onClose}
            className="absolute top-0 right-4 p-2 rounded-full bg-white/80 hover:bg-white shadow-sm text-gray-400 hover:text-gray-600 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        )}
      </div>
    </div>
  )
}