'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Shield, Star } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

interface HeroSectionProps {
  onStart: () => void
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const { t } = useLanguage()
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white">
      {/* Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-100/50 rounded-full blur-3xl opacity-60" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-100/50 rounded-full blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-10">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8"
        >
          {/* Hero Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-indigo-50 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            <Zap size={14} className="fill-indigo-600" />
            HERO.BADGE
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-2">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[1.1] tracking-tight"
            >
              Your Money is a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-purple-600">
                Game
              </span>
              . <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">
                Stop Losing
              </span>
              .
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-gray-500 max-w-lg leading-relaxed pt-4"
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
            className="flex flex-col sm:flex-row gap-6 items-center pt-4"
          >
            <motion.button
              onClick={onStart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="group bg-gray-900 text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-black transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl min-w-[240px] justify-center"
            >
              Start Wealth Checkup
              <motion.div
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowRight size={20} />
              </motion.div>
            </motion.button>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white px-4 py-2 rounded-full border border-gray-100 shadow-sm">
              <CheckCircle2 className="text-green-500" size={16} />
              <span className="font-medium">No bank connection needed • 30s setup</span>
            </div>
          </motion.div>

          {/* Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="flex items-center gap-8 pt-4"
          >
            <div>
              <div className="text-3xl font-black text-gray-900">98%</div>
              <div className="text-xs text-gray-500 font-medium">hero.stats.satisfaction</div>
            </div>
            <div className="h-8 w-px bg-gray-200" />
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <div className="text-sm text-gray-600 font-medium">Trusted by 850k+ users</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Interactive Demo */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative flex justify-center lg:justify-end"
        >
          <PhoneMockup />

          {/* Floating Emojis */}
          <motion.div
            className="absolute top-0 left-0 text-5xl drop-shadow-xl"
            animate={{ y: [0, -20, 0], rotate: [0, 10, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          >
            💰
          </motion.div>
          <motion.div
            className="absolute bottom-40 -right-4 text-4xl drop-shadow-xl"
            animate={{ y: [0, -15, 0], x: [0, 10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          >
            🎯
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

// Enhanced Phone Mockup Component
function PhoneMockup() {
  return (
    <div className="relative z-10">
      {/* Phone Frame */}
      <div className="relative w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl mx-auto overflow-hidden">
        {/* Screen */}
        <div className="absolute inset-0 bg-gray-900 rounded-[2.5rem] overflow-hidden">
          {/* Status Bar */}
          <div className="h-12 flex items-center justify-between px-6 pt-2">
            <div className="text-white text-xs font-medium">9:41</div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-2xl z-20"></div>

          {/* App Content */}
          <div className="p-6 h-full flex flex-col items-center justify-center relative">

            {/* Main Circle - Savings */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="relative w-56 h-56 mb-12"
            >
              {/* Green Gradient Circle */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full shadow-[0_0_40px_rgba(16,185,129,0.4)] flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="text-4xl font-bold mb-1">$332.40</div>
                  <div className="text-sm font-medium opacity-90">Saved This Month</div>
                </div>
              </div>

              {/* Floating Graph Icon */}
              <motion.div
                className="absolute -top-6 -right-2 bg-white rounded-xl p-3 shadow-lg"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              >
                <TrendingUp className="w-6 h-6 text-emerald-500" />
              </motion.div>
            </motion.div>

            {/* Transaction Card */}
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="w-full bg-gray-800/80 backdrop-blur-md rounded-2xl p-4 border border-gray-700/50 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center text-2xl">
                🍔
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-white font-bold">McDonald's</span>
                  <span className="text-red-400 font-bold">-$12.49</span>
                </div>
                <div className="text-gray-400 text-xs mt-1">Fast Food • Today</div>
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Floating Notification - Outside Phone */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.5, type: "spring" }}
        className="absolute top-1/3 -right-24 bg-white rounded-2xl p-4 shadow-xl border border-gray-100 max-w-[200px] z-30"
      >
        <div className="flex items-center gap-2 text-emerald-600 font-bold text-lg mb-1">
          <TrendingUp size={20} />
          <span>+$47.50</span>
        </div>
        <p className="text-xs text-gray-600 font-medium leading-tight">You saved by cooking at home!</p>
      </motion.div>
    </div>
  )
}