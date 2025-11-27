'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Shield, Star } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import { useCountry } from './CountrySelector'

interface HeroSectionProps {
  onStart: () => void
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const { t } = useLanguage()
  const { formatCurrency } = useCountry()
  const [currentStats, setCurrentStats] = useState(0)
  const [isLoaded, setIsLoaded] = useState(false)

  // Statistics data
  const stats = [
    { value: 12500, label: t('hero.stats.saved'), prefix: '$', animated: true },
    { value: 850, label: t('hero.stats.users'), suffix: 'k+', animated: true },
    { value: 98, label: t('hero.stats.satisfaction'), suffix: '%', animated: true }
  ]

  useEffect(() => {
    setIsLoaded(true)
    const interval = setInterval(() => {
      setCurrentStats((prev) => (prev + 1) % stats.length)
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-200/30 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-emerald-200/30 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 right-1/3 w-64 h-64 bg-purple-200/20 rounded-full blur-3xl animate-pulse delay-2000" />
        
        {/* Floating Elements */}
        <motion.div
          className="absolute top-20 left-20 text-4xl"
          animate={{ 
            y: [0, -20, 0],
            rotate: [0, 10, 0]
          }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          💰
        </motion.div>
        <motion.div
          className="absolute bottom-32 right-20 text-3xl"
          animate={{ 
            y: [0, -15, 0],
            x: [0, 10, 0]
          }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        >
          📈
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-10 text-2xl"
          animate={{ 
            scale: [1, 1.1, 1],
            rotate: [0, -10, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        >
          🎯
        </motion.div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700 px-4 py-2 rounded-full text-sm font-semibold uppercase tracking-wide"
          >
            <Zap size={16} />
            {t('hero.badge')}
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl md:text-7xl font-black text-gray-900 leading-tight"
            >
              Your Money is a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-emerald-600">
                Game
              </span>
              .{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">
                Stop
              </span>
              <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Losing
              </span>
              .
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-gray-600 max-w-2xl leading-relaxed"
            >
              Forget boring spreadsheets. Simply drag, drop, and watch your savings grow. 
              See exactly what you can spend today without going broke.
            </motion.p>
          </div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 items-start"
          >
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-gray-800 transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl"
            >
              Start Wealth Checkup
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.button>

            <div className="flex items-center gap-3 text-sm text-gray-600 bg-white/70 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <CheckCircle2 className="text-green-500" size={16} />
              <span className="font-medium">No bank connection needed • 30s setup</span>
            </div>
          </motion.div>

          {/* Dynamic Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex gap-8"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStats}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-gray-900 flex items-baseline">
                  {stats[currentStats].prefix}
                  <AnimatedNumber 
                    value={stats[currentStats].value} 
                    duration={1000}
                  />
                  {stats[currentStats].suffix}
                </div>
                <div className="text-sm text-gray-600 font-medium">
                  {stats[currentStats].label}
                </div>
              </motion.div>
            </AnimatePresence>
            
            {/* Trust Indicators */}
            <div className="flex items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 1.2 + i * 0.1 }}
                >
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                </motion.div>
              ))}
              <span className="text-sm text-gray-600 ml-2">Trusted by 850k+ users</span>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative"
        >
          <PhoneMockup />
        </motion.div>
      </div>
    </section>
  )
}

// Animated Number Component
function AnimatedNumber({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0)

  useEffect(() => {
    let start = 0
    const increment = value / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= value) {
        setDisplayValue(value)
        clearInterval(timer)
      } else {
        setDisplayValue(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [value, duration])

  return <span>{displayValue.toLocaleString()}</span>
}

// Enhanced Phone Mockup Component
function PhoneMockup() {
  const [currentAmount, setCurrentAmount] = useState(320.50)
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true)
      setTimeout(() => {
        setCurrentAmount(prev => prev + Math.random() * 50 - 25)
        setIsAnimating(false)
      }, 300)
    }, 4000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative">
      {/* Phone Frame */}
      <div className="relative w-[350px] h-[700px] bg-gray-900 rounded-[3rem] border-8 border-gray-800 shadow-2xl mx-auto">
        {/* Screen */}
        <div className="absolute inset-4 bg-gradient-to-b from-gray-900 to-gray-800 rounded-[2.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="h-8 bg-gray-800 flex items-center justify-between px-6">
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            <div className="text-white text-xs font-medium">9:41</div>
            <div className="flex items-center gap-1">
              <div className="w-4 h-2 bg-white rounded-sm"></div>
            </div>
          </div>

          {/* App Content */}
          <div className="p-6 h-full flex flex-col items-center justify-center">
            {/* Profit Orb */}
            <motion.div
              animate={isAnimating ? { scale: [1, 1.05, 1] } : {}}
              className="relative w-48 h-48 mb-8"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full shadow-lg shadow-green-500/30"></div>
              <div className="absolute inset-2 bg-green-500 rounded-full flex items-center justify-center">
                <div className="text-center text-white">
                  <motion.div
                    key={currentAmount}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-3xl font-bold"
                  >
                    ${currentAmount.toFixed(2)}
                  </motion.div>
                  <div className="text-sm opacity-90">Saved This Month</div>
                </div>
              </div>
              
              {/* Floating Indicators */}
              <motion.div
                className="absolute -top-4 -right-4 bg-white rounded-lg p-2 shadow-lg"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <TrendingUp className="w-5 h-5 text-green-500" />
              </motion.div>
            </motion.div>

            {/* Transaction Preview */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="w-full bg-gray-800/60 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-xl">
                  🍔
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-medium">McDonald's</span>
                    <span className="text-red-400">-$12.49</span>
                  </div>
                  <div className="text-gray-400 text-sm">Fast Food • Today</div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Notch */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-2xl"></div>
        
        {/* Reflection */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/10 to-transparent rounded-r-[3rem] pointer-events-none"></div>
      </div>

      {/* Floating Notification */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="absolute -right-8 top-1/3 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-xs"
      >
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg">
          <TrendingUp size={20} />
          <span>+$47.50</span>
        </div>
        <p className="text-sm text-gray-600">You saved by cooking at home!</p>
      </motion.div>
    </div>
  )
}