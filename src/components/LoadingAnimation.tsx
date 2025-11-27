'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'

interface LoadingAnimationProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export default function LoadingAnimation({
  size = 'md',
  className = ''
}: LoadingAnimationProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-24 h-24',
    xl: 'w-32 h-32'
  }

  return (
    <div className={`relative flex items-center justify-center ${sizeClasses[size]} ${className}`}>
      <motion.div
        className="relative w-full h-full"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{
          opacity: 1,
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 2,
          ease: "easeInOut",
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        <Image
          src="/icon.png"
          alt="Loading..."
          fill
          className="object-contain"
          priority
        />
      </motion.div>
    </div>
  )
}