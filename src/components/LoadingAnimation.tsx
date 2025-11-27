'use client'

import { motion } from 'framer-motion'

interface LoadingAnimationProps {
  type?: 'spinner' | 'pulse' | 'wave' | 'dots' | 'financial'
  size?: 'sm' | 'md' | 'lg'
  color?: 'indigo' | 'green' | 'blue' | 'purple'
}

export default function LoadingAnimation({ 
  type = 'financial', 
  size = 'md', 
  color = 'indigo' 
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-12 h-12', 
    lg: 'w-24 h-24'
  }

  const colorClasses = {
    indigo: 'text-indigo-600',
    green: 'text-green-600',
    blue: 'text-blue-600',
    purple: 'text-purple-600'
  }

  if (type === 'financial') {
    return <FinancialLoader size={size} color={color} />
  }

  if (type === 'wave') {
    return <WaveLoader size={size} color={color} />
  }

  if (type === 'dots') {
    return <DotsLoader size={size} color={color} />
  }

  if (type === 'pulse') {
    return <PulseLoader size={size} color={color} />
  }

  // Default spinner
  return (
    <div className={`${sizeClasses[size]} ${colorClasses[color]}`}>
      <motion.div
        className="w-full h-full border-2 border-current border-t-transparent rounded-full"
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
      />
    </div>
  )
}

function FinancialLoader({ size, color }: { size: string; color: string }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
  
  return (
    <div className="flex flex-col items-center gap-4">
      {/* Financial Chart Animation */}
      <div className="flex items-end gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <motion.div
            key={i}
            className={`w-2 bg-gradient-to-t from-green-400 to-green-600 rounded-t-sm ${
              size === 'sm' ? 'w-1' : size === 'md' ? 'w-2' : 'w-3'
            }`}
            initial={{ height: 8 }}
            animate={{ 
              height: [8, 16 + i * 4, 8],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>

      {/* Dollar Sign Animation */}
      <motion.div
        className="text-green-600 font-bold text-2xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 5, -5, 0]
        }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        $
      </motion.div>

      {/* Profit Indicator */}
      <motion.div 
        className="flex items-center gap-1 text-xs text-green-600"
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <motion.span
          animate={{ x: [0, 3, 0] }}
          transition={{ duration: 1, repeat: Infinity }}
        >
          ↗
        </motion.span>
        +12.5%
      </motion.div>
    </div>
  )
}

function WaveLoader({ size, color }: { size: string; color: string }) {
  const waveHeight = size === 'sm' ? 'h-8' : size === 'md' ? 'h-16' : 'h-24'
  const colorClass = `bg-${color}-600`

  return (
    <div className={`flex items-center gap-1 ${waveHeight}`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          className={`w-1 ${colorClass} rounded-full`}
          animate={{ 
            scaleY: [0.3, 1, 0.3],
            opacity: [0.6, 1, 0.6]
          }}
          transition={{
            duration: 1.2,
            repeat: Infinity,
            delay: i * 0.15,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

function DotsLoader({ size, color }: { size: string; color: string }) {
  const dotSize = size === 'sm' ? 'w-2 h-2' : size === 'md' ? 'w-3 h-3' : 'w-4 h-4'
  const colorClass = `bg-${color}-600`

  return (
    <div className="flex gap-1">
      {[1, 2, 3].map((i) => (
        <motion.div
          key={i}
          className={`${dotSize} ${colorClass} rounded-full`}
          animate={{ 
            scale: [0.8, 1.2, 0.8],
            opacity: [0.5, 1, 0.5]
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: i * 0.2,
            ease: "easeInOut"
          }}
        />
      ))}
    </div>
  )
}

function PulseLoader({ size, color }: { size: string; color: string }) {
  const sizeClass = size === 'sm' ? 'w-8 h-8' : size === 'md' ? 'w-16 h-16' : 'w-24 h-24'
  const colorClass = `bg-${color}-600`

  return (
    <div className={`${sizeClass} relative flex items-center justify-center`}>
      <motion.div
        className={`absolute inset-0 ${colorClass} rounded-full opacity-20`}
        animate={{ 
          scale: [0.8, 1.2, 0.8],
          opacity: [0.6, 0.1, 0.6]
        }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className={`w-1/2 h-1/2 ${colorClass} rounded-full`}
        animate={{ 
          scale: [0.9, 1.1, 0.9] 
        }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  )
}

// Page Transition Loader
export function PageLoader() {
  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="text-center">
        <FinancialLoader size="lg" color="indigo" />
        <motion.p
          className="mt-6 text-lg font-medium text-gray-700"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          Loading FinleyBook...
        </motion.p>
      </div>
    </div>
  )
}

// Button Loading State
export function ButtonSpinner({ size = 'sm' }: { size?: 'sm' | 'md' }) {
  const spinnerSize = size === 'sm' ? 'w-4 h-4' : 'w-6 h-6'
  
  return (
    <motion.div
      className={`${spinnerSize} border-2 border-white border-t-transparent rounded-full`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  )
}