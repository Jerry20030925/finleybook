'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate, AnimatePresence } from 'framer-motion'
import { ArrowRight, CheckCircle2, TrendingUp, Zap, Shield, Star, ArrowUpRight, ArrowDownRight, Wallet, CreditCard, Lock as LockIcon } from 'lucide-react'
import { useLanguage } from './LanguageProvider'
import Logo from '@/components/Logo'
import CountUp from 'react-countup'

interface HeroSectionProps {
  onStart: () => void
}

export default function HeroSection({ onStart }: HeroSectionProps) {
  const { t } = useLanguage()
  const [isLoaded, setIsLoaded] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Mouse parallax effect
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)

  useEffect(() => {
    setIsLoaded(true)

    const handleMouseMove = (e: MouseEvent) => {
      const { clientX, clientY } = e
      const { innerWidth, innerHeight } = window
      mouseX.set(clientX / innerWidth)
      mouseY.set(clientY / innerHeight)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [mouseX, mouseY])

  return (
    <section ref={containerRef} className="relative min-h-screen flex items-center justify-center overflow-hidden bg-white selection:bg-indigo-100">
      {/* Logo - Top Left */}
      <div className="absolute top-6 left-6 z-50">
        <Logo size="lg" />
      </div>

      {/* Fluid Background Animation */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            x: [0, 100, 0],
            y: [0, -50, 0]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-gradient-to-br from-purple-200/40 to-indigo-200/40 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            rotate: [0, -60, 0],
            x: [0, -100, 0],
            y: [0, 50, 0]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-gradient-to-tr from-green-200/40 to-emerald-200/40 rounded-full blur-[100px] opacity-60"
        />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            x: [0, 50, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[40%] left-[30%] w-[40%] h-[40%] bg-blue-100/30 rounded-full blur-[80px] opacity-40"
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center pt-20 lg:pt-0">
        {/* Left Column - Content */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : -50 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-8 relative"
        >
          {/* Floating 3D Elements (Parallax) */}
          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={20} className="absolute -top-20 -left-20 hidden lg:block">
            <div className="text-6xl filter drop-shadow-2xl rotate-12">💎</div>
          </FloatingElement>

          {/* Hero Badge */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-md border border-indigo-100 text-indigo-600 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm"
          >
            <Zap size={14} className="fill-indigo-600" />
            {t('landing.badge')}
          </motion.div>

          {/* Main Heading */}
          <div className="space-y-4 relative">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-gray-900 leading-[0.95] tracking-tight"
            >
              Stop Just Spending.
              <br />
              <span className="relative inline-block">
                <span className="relative z-10 text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">
                  Start Building Wealth.
                </span>
                <motion.div
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  className="absolute bottom-2 left-0 w-full h-4 bg-indigo-100/50 -z-10 -rotate-1 origin-left"
                />
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="text-xl text-gray-600 max-w-lg leading-relaxed font-medium"
            >
              {t('landing.hero.desc')}
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
              className="group bg-gray-900 text-white px-8 py-4 rounded-2xl text-lg font-bold hover:bg-black transition-all duration-300 flex items-center gap-3 shadow-xl hover:shadow-2xl shadow-indigo-500/20 min-w-[240px] justify-center relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative z-10 flex items-center gap-3">
                {t('landing.cta.start')}
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            </motion.button>

            <div className="flex items-center gap-2 text-sm text-gray-600 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50">
              <CheckCircle2 className="text-green-500" size={16} />
              <span className="font-medium">{t('landing.hero.sub')}</span>
            </div>
          </motion.div>

          {/* Trust Signals & Social Proof */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.6 }}
            className="pt-8 space-y-4"
          >
            <div className="flex items-center gap-6 text-sm font-medium text-gray-500">
              <div className="flex items-center gap-2">
                <Shield className="w-4 h-4 text-emerald-500" />
                <span>{t('landing.trust.security')}</span>
              </div>
              <div className="flex items-center gap-2">
                <LockIcon className="w-4 h-4 text-indigo-500" />
                <span>{t('landing.trust.privacy')}</span>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex -space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-gray-100 flex items-center justify-center overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="User" className="w-full h-full" />
                  </div>
                ))}
                <div className="w-8 h-8 rounded-full border-2 border-white bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600">
                  +10k
                </div>
              </div>
              <div className="text-sm text-gray-600">
                <div className="font-bold text-gray-900">{t('landing.trust.users')}</div>
                <div className="flex items-center gap-1 text-xs">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1">4.9/5</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right Column - Interactive 3D Mockup */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: isLoaded ? 1 : 0, x: isLoaded ? 0 : 50 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          className="relative flex justify-center lg:justify-end perspective-1000"
        >
          {/* Floating Elements around phone */}
          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={-30} className="absolute top-20 right-0 z-20">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 rotate-6">
              <div className="bg-green-100 p-2 rounded-full">
                <TrendingUp size={24} className="text-green-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Monthly Savings</div>
                <div className="text-lg font-black text-gray-900">+$450.00</div>
              </div>
            </div>
          </FloatingElement>

          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={40} className="absolute bottom-40 -left-10 z-20">
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 flex items-center gap-3 -rotate-6">
              <div className="bg-purple-100 p-2 rounded-full">
                <CreditCard size={24} className="text-purple-600" />
              </div>
              <div>
                <div className="text-xs text-gray-500 font-bold">Cashback</div>
                <div className="text-lg font-black text-gray-900">3.5%</div>
              </div>
            </div>
          </FloatingElement>

          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={10}>
            <ProfessionalPhoneMockup />
          </FloatingElement>

          {/* 3D Floating Emojis */}
          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={60} className="absolute -top-10 left-20 text-6xl drop-shadow-2xl z-0">
            💰
          </FloatingElement>
          <FloatingElement mouseX={mouseX} mouseY={mouseY} depth={-20} className="absolute bottom-20 -right-4 text-5xl drop-shadow-2xl z-30">
            🚀
          </FloatingElement>
        </motion.div>
      </div>
    </section>
  )
}

// Helper for parallax floating elements
function FloatingElement({ children, mouseX, mouseY, depth = 20, className = "" }: { children: React.ReactNode, mouseX: any, mouseY: any, depth?: number, className?: string }) {
  const x = useTransform(mouseX, [0, 1], [-depth, depth])
  const y = useTransform(mouseY, [0, 1], [-depth, depth])

  return (
    <motion.div style={{ x, y }} className={className}>
      {children}
    </motion.div>
  )
}

// Professional Phone Mockup with Live Feed Animation
function ProfessionalPhoneMockup() {
  const [balance, setBalance] = useState(1603.80)
  const [transactions, setTransactions] = useState([
    { id: 1, title: 'Opening Balance', amount: 1603.80, type: 'income', icon: '💰' }
  ])

  useEffect(() => {
    const sequence = [
      { title: 'Grocery Store', amount: -85.20, type: 'expense', icon: '🛒', delay: 1000 },
      { title: 'Freelance Work', amount: 450.00, type: 'income', icon: '💻', delay: 2500 },
      { title: 'Starbucks', amount: -5.50, type: 'expense', icon: '☕️', delay: 4000 },
      { title: 'Starbucks', amount: -5.50, type: 'expense', icon: '☕️', delay: 5500 },
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
      setTransactions([{ id: 1, title: 'Opening Balance', amount: 1603.80, type: 'income', icon: '💰' }])
      setBalance(1603.80)
    }, 9000) // Reset after sequence finishes

    return () => {
      timeouts.forEach(clearTimeout)
      clearTimeout(loopTimeout)
    }
  }, [transactions.length === 1]) // Re-run when reset to initial state

  return (
    <div className="relative z-10 transform rotate-[-5deg] hover:rotate-0 transition-transform duration-700 ease-out">
      {/* Phone Frame */}
      <div className="relative w-[340px] h-[680px] bg-gray-900 rounded-[3.5rem] border-[10px] border-gray-800 shadow-2xl mx-auto overflow-hidden ring-1 ring-white/10 shadow-indigo-500/30">
        {/* Screen */}
        <div className="absolute inset-0 bg-gray-950 rounded-[3rem] overflow-hidden flex flex-col">
          {/* Status Bar */}
          <div className="h-14 flex items-center justify-between px-8 pt-4 shrink-0 z-20">
            <div className="text-white text-xs font-medium">9:41</div>
            <div className="flex items-center gap-1.5">
              <div className="w-4 h-2.5 bg-white rounded-[1px]"></div>
            </div>
          </div>

          {/* Notch */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-36 h-8 bg-gray-800 rounded-b-2xl z-20"></div>

          {/* App Content */}
          <div className="flex-1 flex flex-col p-6 pt-12 relative">

            {/* Balance Card */}
            <motion.div
              layout
              className="bg-gradient-to-br from-[#6366f1] to-[#a855f7] rounded-[2rem] p-8 mb-8 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-16 -mt-16" />
              <div className="relative z-10">
                <div className="text-indigo-100 text-sm font-medium mb-2">Total Balance</div>
                <div className="text-4xl font-bold tracking-tight mb-6">
                  ${balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
                <div className="flex gap-3">
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <ArrowUpRight className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center hover:bg-white/30 transition-colors cursor-pointer">
                    <ArrowDownRight className="w-5 h-5 text-rose-300" />
                  </div>
                  <div className="bg-white/20 backdrop-blur-md rounded-full w-10 h-10 flex items-center justify-center ml-auto hover:bg-white/30 transition-colors cursor-pointer">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Live Transactions Feed */}
            <div className="flex-1">
              <div className="text-gray-500 text-xs font-bold uppercase tracking-wider mb-4 px-2">Live Activity</div>
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
                      className="bg-gray-900/50 backdrop-blur-md border border-gray-800 rounded-2xl p-4 flex items-center gap-4"
                    >
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xl ${tx.type === 'income' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                        }`}>
                        {tx.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-white font-bold text-sm truncate">{tx.title}</div>
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