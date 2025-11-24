'use client'

import Image from 'next/image'
import { useState } from 'react'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6',
  md: 'h-8',
  lg: 'h-12',
  xl: 'h-16'
}

const textSizeClasses = {
  sm: 'text-lg',
  md: 'text-xl',
  lg: 'text-2xl',
  xl: 'text-3xl'
}

export default function Logo({ size = 'md', className = '' }: LogoProps) {
  const [imageError, setImageError] = useState(false)

  if (imageError) {
    // Fallback to text logo
    return (
      <div className={`flex items-center ${className}`}>
        <span className={`font-bold ${textSizeClasses[size]} text-primary-600`}>
          FinleyBook
        </span>
      </div>
    )
  }

  return (
    <div className={`flex items-center ${className}`}>
      <Image
        src="/logo.png"
        alt="FinleyBook"
        width={200}
        height={60}
        className={`${sizeClasses[size]} w-auto`}
        priority
        onError={() => setImageError(true)}
      />
    </div>
  )
}