'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useInView, useMotionValue, useSpring, useTransform, AnimatePresence } from 'framer-motion'
import { ChartBarIcon, DocumentMagnifyingGlassIcon, ShieldCheckIcon, ChatBubbleLeftRightIcon, CheckCircleIcon, UserGroupIcon, GlobeAltIcon, XMarkIcon, CheckIcon, ArrowTrendingUpIcon, WalletIcon, CreditCardIcon } from '@heroicons/react/24/outline'
import AuthModal from './AuthModal'
import Logo from './Logo'
import { useLanguage } from './LanguageProvider'
import LanguageSwitcher from './LanguageSwitcher'
import { useCurrency, COUNTRIES } from '@/components/CurrencyProvider'
import Link from 'next/link'

const features = [
  {
    key: 'aggregation',
    icon: DocumentMagnifyingGlassIcon,
  },
  {
    key: 'analysis',
    icon: ChartBarIcon,
  },
  {
    key: 'tax',
    icon: ShieldCheckIcon,
  },
  {
    key: 'ai',
    icon: ChatBubbleLeftRightIcon,
  },
]

function CountUp({ value, suffix = '', prefix = '' }: { value: number, suffix?: string, prefix?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const motionValue = useMotionValue(0)
  const springValue = useSpring(motionValue, { duration: 2500, bounce: 0 })
  const rounded = useTransform(springValue, (latest) => Math.floor(latest))
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    if (isInView) {
      motionValue.set(value)
    }
  }, [isInView, value, motionValue])

  useEffect(() => {
    return rounded.on("change", (latest) => {
      setDisplayValue(latest)
    })
  }, [rounded])

  return <span ref={ref}>{prefix}{displayValue.toLocaleString()}{suffix}</span>
}

export default function Landing() {
  const [showAuth, setShowAuth] = useState(false)
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin')
  const { t, language } = useLanguage()
  const { country } = useCurrency()

  const openAuth = (mode: 'signin' | 'signup') => {
    setAuthMode(mode)
    setShowAuth(true)
  }

  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5 }
    }
  }

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const [showCountrySelector, setShowCountrySelector] = useState(false)
  const { setCountry } = useCurrency()
  const [demoTab, setDemoTab] = useState<'overview' | 'transactions' | 'budget'>('overview')

  const demoData = {
    overview: {
      total: '¥1,245,678.00',
      change: '+12.5%',
      income: '+¥25,000',
      expense: '-¥8,450',
      chart: [40, 65, 45, 80, 55, 90, 70]
    },
    transactions: {
      total: '¥45,230.00',
      change: '+5.2%',
      income: '+¥12,000',
      expense: '-¥3,200',
      chart: [30, 45, 60, 40, 70, 50, 80]
    },
    budget: {
      total: '¥8,500.00',
      change: '-2.1%',
      income: '¥10,000',
      expense: '¥1,500',
      chart: [80, 70, 60, 50, 40, 30, 20]
    }
  }

  return (
    <div className="bg-white">
      {/* Country Selector Modal */}
      {showCountrySelector && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-900">
                {language === 'en' ? 'Select Country' : '选择国家或地区'}
              </h3>
              <button
                onClick={() => setShowCountrySelector(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 gap-2 max-h-[60vh] overflow-y-auto">
              {COUNTRIES.map((c) => (
                <button
                  key={c.code}
                  onClick={() => {
                    setCountry(c.code)
                    setShowCountrySelector(false)
                  }}
                  className={`flex items-center justify-between p-4 rounded-xl transition-colors ${country.code === c.code
                    ? 'bg-primary-50 text-primary-700 ring-1 ring-primary-700/10'
                    : 'hover:bg-gray-50 text-gray-700'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <span className="font-medium">{t(`countries.${c.code}`)}</span>
                  </div>
                  {country.code === c.code && (
                    <CheckIcon className="h-5 w-5 text-primary-600" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-100 overflow-hidden">
        {/* Header */}
        <header className="px-6 lg:px-8 relative z-10">
          <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
            <div className="flex lg:flex-1">
              <div className="-m-1.5 p-1.5">
                <Logo size="lg" />
              </div>
            </div>
            <div className="flex items-center gap-4 lg:flex-1 lg:justify-end">
              <LanguageSwitcher />
              <button
                onClick={() => openAuth('signin')}
                className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors"
              >
                {t('nav.login')} <span aria-hidden="true">&rarr;</span>
              </button>
              <button
                onClick={() => openAuth('signup')}
                className="btn-primary"
              >
                {t('nav.register')}
              </button>
            </div>
          </nav>
        </header>

        {/* Hero Section */}
        <div className="relative isolate px-6 pt-14 lg:px-8">
          <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80" aria-hidden="true">
            <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
          </div>

          <div className="mx-auto max-w-7xl py-24 sm:py-32 lg:py-40">
            <motion.div
              className="text-center relative z-10"
              initial="initial"
              animate="animate"
              variants={staggerContainer}
            >
              <motion.h1
                className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl"
                variants={fadeInUp}
              >
                {t('hero.title_prefix')}
                <span className="text-primary-600 mx-2 inline-block relative">
                  {t('hero.title_highlight')}
                  <motion.svg
                    className="absolute w-full h-3 -bottom-1 left-0 text-primary-200 -z-10"
                    viewBox="0 0 100 10"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                  >
                    <path d="M0 5 Q 50 10 100 5" fill="none" stroke="currentColor" strokeWidth="8" />
                  </motion.svg>
                </span>
                {t('hero.title_suffix')}
              </motion.h1>
              <motion.p
                className="mt-6 text-lg leading-8 text-gray-600 max-w-2xl mx-auto"
                variants={fadeInUp}
              >
                {t('hero.description')}
              </motion.p>
              <motion.div
                className="mt-10 flex items-center justify-center gap-x-6"
                variants={fadeInUp}
              >
                <button
                  onClick={() => openAuth('signup')}
                  className="btn-primary text-lg px-8 py-3 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {t('hero.start')}
                </button>
                <a href="#features" className="text-sm font-semibold leading-6 text-gray-900 hover:text-primary-600 transition-colors">
                  {t('hero.learn_more')} <span aria-hidden="true">→</span>
                </a>
              </motion.div>
            </motion.div>

            {/* Hero Visual */}
            <motion.div
              initial={{ opacity: 0, y: 40, rotateX: 10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: 0.6, duration: 1, type: "spring" }}
              className="mt-16 flow-root sm:mt-24 relative z-10"
            >
              <div className="-m-2 rounded-xl bg-gray-900/5 p-2 ring-1 ring-inset ring-gray-900/10 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
                <div className="rounded-md shadow-2xl ring-1 ring-gray-900/10 bg-white p-4 sm:p-8 overflow-hidden relative">
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary-400 to-blue-500"></div>
                  <div className="flex flex-col sm:flex-row gap-8 items-center">
                    <div className="flex-1 w-full space-y-6">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                          <WalletIcon className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-sm text-gray-500">Total Balance</div>
                          <div className="text-3xl font-bold text-gray-900">¥124,500.00</div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Monthly Budget</span>
                          <span className="font-medium text-gray-900">75%</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full bg-primary-500 rounded-full"
                            initial={{ width: 0 }}
                            animate={{ width: "75%" }}
                            transition={{ delay: 1, duration: 1.5 }}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 w-full h-48 flex items-end gap-2 sm:gap-4">
                      {[35, 55, 40, 70, 50, 85, 65].map((h, i) => (
                        <motion.div
                          key={i}
                          className="flex-1 bg-gradient-to-t from-primary-500 to-primary-300 rounded-t-lg opacity-80 hover:opacity-100 transition-opacity cursor-pointer"
                          initial={{ height: 0 }}
                          animate={{ height: `${h}%` }}
                          transition={{ delay: 1.2 + i * 0.1, duration: 0.8, type: "spring" }}
                          whileHover={{ scaleY: 1.1 }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]" aria-hidden="true">
            <div className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }} />
          </div>
        </div>

        {/* Features Section */}
        <div id="features" className="bg-white py-24 sm:py-32 relative overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <motion.div
              className="mx-auto max-w-2xl lg:text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-base font-semibold leading-7 text-primary-600">{t('features.title')}</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                {t('features.subtitle')}
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                {t('features.description')}
              </p>
            </motion.div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-2">
                {features.map((feature, index) => {
                  const titleKey = `features.items.${feature.key}.title`
                  const descKey = `features.items.${feature.key}.desc`
                  return (
                    <motion.div
                      key={feature.key}
                      className="flex flex-col bg-gray-50 rounded-2xl p-8 hover:bg-gray-100 transition-colors duration-300"
                      initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                      <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                        <div className="h-10 w-10 rounded-lg bg-primary-600 flex items-center justify-center">
                          <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                        </div>
                        {t(titleKey)}
                      </dt>
                      <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                        <p className="flex-auto">{t(descKey)}</p>
                      </dd>
                    </motion.div>
                  )
                })}
              </dl>
            </div>
          </div>
        </div>

        {/* Interactive Demo Section */}
        <div className="bg-white py-24 sm:py-32 overflow-hidden">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  {language === 'en' ? 'Experience the Power' : '体验强大功能'}
                </h2>
                <p className="mt-4 text-lg leading-8 text-gray-600">
                  {language === 'en' ? 'See how FinleyBook transforms your financial data.' : '看看 FinleyBook 如何改变您的财务管理方式。'}
                </p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <motion.div
                  initial={{ opacity: 0, x: -50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8 }}
                  className="relative"
                >
                  <div className="absolute -inset-4 bg-gradient-to-r from-primary-100 to-blue-100 rounded-xl blur-lg opacity-70"></div>
                  <div className="relative bg-white rounded-xl shadow-2xl p-6 border border-gray-100">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-red-400"></div>
                        <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                      </div>
                      <div className="flex gap-2">
                        {(['overview', 'transactions', 'budget'] as const).map((tab) => (
                          <button
                            key={tab}
                            onClick={() => setDemoTab(tab)}
                            className={`text-xs px-2 py-1 rounded-md transition-colors ${demoTab === tab
                              ? 'bg-primary-50 text-primary-600 font-medium'
                              : 'text-gray-400 hover:text-gray-600'
                              }`}
                          >
                            {tab.charAt(0).toUpperCase() + tab.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    <AnimatePresence mode="wait">
                      <motion.div
                        key={demoTab}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                        className="space-y-4"
                      >
                        <div className="flex justify-between items-end">
                          <div>
                            <div className="text-sm text-gray-500">Total Assets</div>
                            <div className="text-2xl font-bold text-gray-900">{demoData[demoTab].total}</div>
                          </div>
                          <div className={`text-sm px-2 py-1 rounded-full ${demoData[demoTab].change.startsWith('+') ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'
                            }`}>
                            {demoData[demoTab].change}
                          </div>
                        </div>

                        <div className="h-32 flex items-end space-x-2">
                          {demoData[demoTab].chart.map((h, i) => (
                            <motion.div
                              key={i}
                              className="flex-1 bg-primary-500 rounded-t-sm"
                              initial={{ height: 0 }}
                              animate={{ height: `${h}%` }}
                              transition={{ delay: i * 0.05, duration: 0.5 }}
                            />
                          ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Income</div>
                            <div className="font-semibold text-green-600">{demoData[demoTab].income}</div>
                          </div>
                          <div className="bg-gray-50 p-3 rounded-lg">
                            <div className="text-xs text-gray-500">Expense</div>
                            <div className="font-semibold text-red-600">{demoData[demoTab].expense}</div>
                          </div>
                        </div>
                      </motion.div>
                    </AnimatePresence>
                  </div>
                </motion.div>

                <div className="space-y-8">
                  {[
                    {
                      titleKey: 'landing.features.tracking',
                      descKey: 'landing.features.insights',
                      icon: GlobeAltIcon
                    },
                    {
                      titleKey: 'landing.features.budgeting',
                      descKey: 'landing.features.security',
                      icon: ChartBarIcon
                    },
                    {
                      titleKey: 'landing.features.security',
                      descKey: 'landing.features.tracking',
                      icon: ShieldCheckIcon
                    }
                  ].map((item, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: 50 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: index * 0.2, duration: 0.5 }}
                      className="flex gap-4"
                    >
                      <div className="flex-shrink-0">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600 text-white shadow-lg">
                          <item.icon className="h-6 w-6" aria-hidden="true" />
                        </div>
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold leading-8 text-gray-900">{t(item.titleKey)}</h3>
                        <p className="text-base leading-7 text-gray-600">{t(item.descKey)}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-900 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:max-w-none">
              <div className="text-center space-y-4">
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                  深受用户信赖
                </h2>
                <p className="text-lg leading-8 text-gray-300">
                  加入数万名用户的行列，开始您的智能财务之旅
                </p>
              </div>
              <dl className="mt-16 grid grid-cols-1 gap-0.5 overflow-hidden rounded-2xl text-center sm:grid-cols-3">
                {[
                  { id: 1, name: '活跃用户', value: '10,000+' },
                  { id: 2, name: '管理资产', value: '¥500M+' },
                  { id: 3, name: '用户好评', value: '99.9%' },
                ].map((stat) => (
                  <motion.div
                    key={stat.id}
                    className="flex flex-col bg-white/5 p-8 hover:bg-white/10 transition-colors duration-300"
                    initial={{ scale: 0.9, opacity: 0 }}
                    whileInView={{ scale: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: stat.id * 0.1 }}
                  >
                    <dt className="text-sm font-semibold leading-6 text-gray-300">{stat.name}</dt>
                    <dd className="order-first text-3xl font-semibold tracking-tight text-white">
                      {stat.id === 1 && <CountUp value={10000} suffix="+" />}
                      {stat.id === 2 && <CountUp value={500} suffix="M+" prefix="¥" />}
                      {stat.id === 3 && <span>99.9%</span>}
                    </dd>
                  </motion.div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-primary-600 relative overflow-hidden">
          <div className="px-6 py-24 sm:px-6 sm:py-32 lg:px-8 relative z-10">
            <motion.div
              className="mx-auto max-w-2xl text-center"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                {t('cta.title')}
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-primary-100">
                {t('cta.description')}
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <button
                  onClick={() => openAuth('signup')}
                  className="rounded-md bg-white px-3.5 py-2.5 text-sm font-semibold text-primary-600 shadow-sm hover:bg-primary-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  {t('cta.button')}
                </button>
                <button className="text-sm font-semibold leading-6 text-white hover:text-primary-100 transition-colors">
                  {t('cta.contact')} <span aria-hidden="true">→</span>
                </button>
              </div>
            </motion.div>
          </div>
          {/* Decorative circles */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500 rounded-full opacity-50 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-primary-700 rounded-full opacity-50 blur-3xl"></div>
        </div>

        {/* Footer */}
        <footer className="bg-gray-50 border-t border-gray-200">
          <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
              <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8">
                <p>{t('footer.copyright')}</p>
                <div className="flex gap-4 md:gap-6">
                  <Link href="/privacy" className="hover:underline hover:text-gray-800 transition-colors">
                    {t('footer.privacy')}
                  </Link>
                  <div className="w-px h-3 bg-gray-300 hidden md:block"></div>
                  <Link href="/terms" className="hover:underline hover:text-gray-800 transition-colors">
                    {t('footer.terms')}
                  </Link>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 md:mt-0">
                <button
                  onClick={() => setShowCountrySelector(true)}
                  className="hover:underline hover:text-gray-800 transition-colors flex items-center gap-1"
                >
                  {country.name}
                </button>
                <span className="text-gray-300">|</span>
                <span className="text-gray-400">{country.flag}</span>
              </div>
            </div>
          </div>
        </footer>

        {/* Auth Modal */}
        {/* Auth Modal */}
        {
          showAuth && (
            <AuthModal
              mode={authMode}
              onClose={() => setShowAuth(false)}
            />
          )
        }
      </div>
    </div>

  )
}