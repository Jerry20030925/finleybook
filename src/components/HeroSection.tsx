'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Shield, Star, ArrowUpRight, ArrowDownRight, Wallet } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import Logo from '@/components/Logo'

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
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Logo size="lg" />
      </div>

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
          <ProfessionalPhoneMockup />

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

// Professional Phone Mockup with Live Feed Animation
function ProfessionalPhoneMockup() {
  const [balance, setBalance] = useState(1250.00)
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Opening Balance', amount: 1250.00, type: 'income', icon: '💰' }
  ])

  useEffect(() => {
    const sequence = [
      { title: 'Starbucks', amount: -5.50, type: 'expense', icon: '☕️', delay: 1000 },
      { title: 'Freelance Work', amount: 450.00, type: 'income', icon: '💻', delay: 2500 },
      { title: 'Grocery Store', amount: -85.20, type: 'expense', icon: '🛒', delay: 4000 },
      { title: 'Netflix', amount: -15.99, type: 'expense', icon: '🎬', delay: 5500 },
      { title: 'Salary', amount: 2500.00, type: 'income', icon: '💸', delay: 7000 },
    ]

    let timeouts: NodeJS.Timeout[] = []

    sequence.forEach((item, index) => {
      const timeout = setTimeout(() => {
        setTransactions(prev => [
          { id: Date.now(), ...item },
          ...prev.slice(0, 3) // Keep only last 4
        ])
        setBalance(prev => prev + item.amount)
      }, item.delay)
      timeouts.push(timeout)
    })

    // Loop the animation
    const loopTimeout = setTimeout(() => {
      setTransactions([{ id: 1, title: 'Opening Balance', amount: 1250.00, type: 'income', icon: '💰' }])
      setBalance(1250.00)
    }, 9000) // Reset after sequence finishes

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(loopTimeout)
    }
  }, [transactions.length === 1]) // Re-run when reset to initial state

  return (
    <div className="relative z-10">
      {/* Phone Frame */}
      <div className="relative w-[320px] h-[640px] bg-gray-900 rounded-[3rem] border-[8px] border-gray-800 shadow-2xl mx-auto overflow-hidden ring-1 ring-white/10">
        {/* Screen */}
        <div className="absolute inset-0 bg-gray-950 rounded-[2.5rem] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="h-12 flex items-center justify-between px-6 pt-2 shrink-0 z-20">
            <div className="text-white text-xs font-medium">9:41</div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-800 rounded-b-2xl z-20"></div>

          {/* App Content */}
          <div className="flex-1 flex flex-col p-6 pt-12 relative">

            {/* Balance Card */}
            <motion.div
              layout
              className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl p-6 mb-8 text-white shadow-lg shadow-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="text-indigo-200 text-sm font-medium mb-1">Total Balance</div>
                <div className="text-3xl font-bold tracking-tight">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="mt-4 flex gap-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ArrowUpRight className="w-4 h-4 text-emerald-300" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2">
                    <ArrowDownRight className="w-4 h-4 text-rose-300" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 ml-auto">
                    <Wallet className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Transactions Feed */}
            <div className="flex-1">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-1">Live Activity</div>
              <div className="space-y-3">
                <AnimatePresence mode="popLayout">
                  {transactions.map((tx) => (
                    <motion.div
                      key={tx.id}
                      layout
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-3 flex items-center gap-3"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                        }`}>
                        {tx.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-medium text-sm truncate">{tx.title}</div>
                        <div className="text-gray-500 text-xs">Just now</div>
                      </div>
                      <div className={`font-bold text-sm ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'
                        }`}>
                        {tx.type === 'income' ? '+' : ''}{tx.amount.toFixed(2)}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}