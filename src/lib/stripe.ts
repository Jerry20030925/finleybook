import { loadStripe } from '@stripe/stripe-js'
import Stripe from 'stripe'

// Client-side Stripe
export const getStripe = () => {
  return loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)
}

// Server-side Stripe
export const stripe = process.env.STRIPE_SECRET_KEY
  ? new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2023-10-16',
    typescript: true,
  })
  : null

// Subscription Plans
export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: '免费版',
    price: 0,
    currency: 'usd',
    interval: 'month',
    features: [
      '基础记账功能',
      '月度报表',
      '5个预算分类',
      '基础数据导出',
      '社区支持'
    ],
    limits: {
      transactions: 50,
      budgets: 5,
      exports: 2
    }
  },
  PRO_MONTHLY: {
    name: 'Pro 月付',
    price: 999, // $9.99 in cents
    currency: 'usd',
    interval: 'month',
    stripePriceId: 'price_1SWsXIDBM183XrjL5aFQQeiJ',
    features: [
      '无限记账功能',
      '高级分析报表',
      '无限预算分类',
      '自动分类识别',
      '数据同步备份',
      'AI 财务建议',
      '优先客服支持',
      '高级数据导出'
    ],
    limits: {
      transactions: -1, // unlimited
      budgets: -1,
      exports: -1
    }
  },
  PRO_YEARLY: {
    name: 'Pro 年付',
    price: 7999, // $79.99 in cents (33% discount)
    currency: 'usd',
    interval: 'year',
    stripePriceId: 'price_1SWsy2DBM183XrjL9RJ4F95Z',
    features: [
      '无限记账功能',
      '高级分析报表',
      '无限预算分类',
      '自动分类识别',
      '数据同步备份',
      'AI 财务建议',
      '优先客服支持',
      '高级数据导出',
      '年度财务规划',
      '税务优化建议'
    ],
    limits: {
      transactions: -1, // unlimited
      budgets: -1,
      exports: -1
    },
    discount: '节省 33%'
  }
} as const

export type SubscriptionPlan = keyof typeof SUBSCRIPTION_PLANS
export type PlanDetails = typeof SUBSCRIPTION_PLANS[SubscriptionPlan]