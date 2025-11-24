'use client'

interface LogoSVGProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

const sizeClasses = {
  sm: 'h-6 w-6',
  md: 'h-8 w-8', 
  lg: 'h-12 w-12',
  xl: 'h-16 w-16'
}

export default function LogoSVG({ size = 'md', className = '' }: LogoSVGProps) {
  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {/* Logo Icon */}
      <svg
        className={`${sizeClasses[size]} text-primary-600`}
        viewBox="0 0 24 24"
        fill="currentColor"
      >
        <path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10 5.16-.26 9-4.45 9-10V7l-10-5z"/>
        <path d="M9 12l2 2 4-4" fill="white" stroke="white" strokeWidth="1"/>
        <circle cx="12" cy="12" r="2" fill="white"/>
      </svg>
      
      {/* Text Logo */}
      <span className="font-bold text-gray-900">
        <span className="text-primary-600">Finley</span>book
      </span>
    </div>
  )
}