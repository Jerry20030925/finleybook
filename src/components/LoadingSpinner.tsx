'use client'

import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  variant?: 'spinner' | 'dots' | 'pulse' | 'bars'
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-8 h-8', 
  lg: 'w-12 h-12',
  xl: 'w-16 h-16'
}

const SpinnerVariant = ({ size }: { size: string }) => (
  <motion.div
    className={`border-2 border-gray-200 border-t-primary-600 rounded-full ${size}`}
    animate={{ rotate: 360 }}
    transition={{ 
      duration: 1,
      repeat: Infinity,
      ease: "linear"
    }}
  />
)

const DotsVariant = ({ size }: { size: string }) => {
  const dotSize = size.includes('4') ? 'w-1 h-1' : 
                 size.includes('8') ? 'w-2 h-2' :
                 size.includes('12') ? 'w-3 h-3' : 'w-4 h-4'
  
  return (
    <div className="flex space-x-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`bg-primary-600 rounded-full ${dotSize}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2
          }}
        />
      ))}
    </div>
  )
}

const PulseVariant = ({ size }: { size: string }) => (
  <motion.div
    className={`bg-primary-600 rounded-full ${size}`}
    animate={{
      scale: [1, 1.2, 1],
      opacity: [0.7, 1, 0.7]
    }}
    transition={{
      duration: 1,
      repeat: Infinity
    }}
  />
)

const BarsVariant = ({ size }: { size: string }) => {
  const barHeight = size.includes('4') ? 'h-4' : 
                   size.includes('8') ? 'h-8' :
                   size.includes('12') ? 'h-12' : 'h-16'
  
  return (
    <div className="flex items-end space-x-1">
      {[0, 1, 2, 3].map((index) => (
        <motion.div
          key={index}
          className={`w-1 bg-primary-600 ${barHeight}`}
          animate={{
            scaleY: [1, 0.5, 1]
          }}
          transition={{
            duration: 0.8,
            repeat: Infinity,
            delay: index * 0.1
          }}
          style={{ transformOrigin: 'bottom' }}
        />
      ))}
    </div>
  )
}

export default function LoadingSpinner({ 
  size = 'md', 
  message, 
  fullScreen = false,
  variant = 'spinner'
}: LoadingSpinnerProps) {
  const sizeClass = sizeClasses[size]

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return <DotsVariant size={sizeClass} />
      case 'pulse':
        return <PulseVariant size={sizeClass} />
      case 'bars':
        return <BarsVariant size={sizeClass} />
      default:
        return <SpinnerVariant size={sizeClass} />
    }
  }

  const content = (
    <motion.div 
      className="flex flex-col items-center justify-center space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      {renderSpinner()}
      {message && (
        <motion.p 
          className="text-gray-600 text-sm font-medium"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {message}
        </motion.p>
      )}
    </motion.div>
  )

  if (fullScreen) {
    return (
      <motion.div 
        className="fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm flex items-center justify-center z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        {content}
      </motion.div>
    )
  }

  return content
}

// Export variants for convenience
export const LoadingScreen = (props: Omit<LoadingSpinnerProps, 'fullScreen'>) => (
  <LoadingSpinner {...props} fullScreen />
)

export const LoadingDots = (props: Omit<LoadingSpinnerProps, 'variant'>) => (
  <LoadingSpinner {...props} variant="dots" />
)

export const LoadingPulse = (props: Omit<LoadingSpinnerProps, 'variant'>) => (
  <LoadingSpinner {...props} variant="pulse" />
)

export const LoadingBars = (props: Omit<LoadingSpinnerProps, 'variant'>) => (
  <LoadingSpinner {...props} variant="bars" />
)