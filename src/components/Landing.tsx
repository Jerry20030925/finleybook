'use client'

import { useState } from 'react'
import { ChartBarIcon, DocumentMagnifyingGlassIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon } from '@heroicons/react/24/outline'
import AuthModal from './AuthModal'
import Logo from './Logo'

const features = [
  {
    name: '智能数据归集',
    description: '自动聚合银行账户、支付平台数据，OCR识别票据信息，支持自然语言记账',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    name: '智能分析预测',
    description: '基于AI的个性化财务分析，现金流预测，智能预算建议',
    icon: ChartBarIcon,
  },
  {
    name: '税务风险预警',
    description: '实时监测税务合规风险，发票验真，重复报销检测，政策变动提醒',
    icon: ShieldCheckIcon,
  },
  {
    name: 'AI智能问答',
    description: '24/7 AI财务助手，自然语言查询财务数据，获取专业建议',
    icon: ChatBubbleLeftRightIcon,
  },
]

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100">
      {/* Header */}
      <header className="px-6 lg:px-8">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <div className="-m-1.5 p-1.5">
              <Logo size="lg" />
            </div>
          </div>
          <div className="flex lg:flex-1 lg:justify-end">
            <button
              onClick={() => openAuth('signin')}
              className="text-sm font-semibold leading-6 text-gray-900 mr-4 hover:text-primary-600"
            >
              登录 <span aria-hidden="true">&rarr;</span>
            </button>
            <button
              onClick={() => openAuth('signup')}
              className="btn-primary"
            >
              免费注册
            </button>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              AI驱动的
              <span className="text-primary-600">个人财务</span>
              管理平台
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              集智能记账、财务分析、税务管理于一体的AI财务助手。
              让复杂的财务管理变得简单智能，助您实现财务自由。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => openAuth('signup')}
                className="btn-primary text-lg px-8 py-3"
              >
                开始使用
              </button>
              <a href="#features" className="text-sm font-semibold leading-6 text-gray-900">
                了解更多 <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-base font-semibold leading-7 text-primary-600">智能财务管理</h2>
            <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              核心功能矩阵
            </p>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              围绕"数据归集、智能分析、风险预警、个性化服务"四大主线，
              提供超越传统记账软件的深度价值。
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
              {features.map((feature) => (
                <div key={feature.name} className="flex flex-col">
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                    <feature.icon className="h-5 w-5 flex-none text-primary-600" aria-hidden="true" />
                    {feature.name}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-primary-600">
        <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              开启您的AI财务管理之旅
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
              立即注册，体验智能化财务管理带来的便捷与安心。
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <button
                onClick={() => openAuth('signup')}
                className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                免费开始
              </button>
              <button className="text-sm font-semibold leading-6 text-white">
                联系我们 <span aria-hidden="true">→</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <p className="text-center text-xs leading-5 text-gray-400">
              &copy; 2024 FinleyBook. All rights reserved.
            </p>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-gray-400">
              智能财务管理，让理财更简单
            </p>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          mode={authMode}
          onClose={() => setShowAuth(false)}
        />
      )}
    </div>
  )
}