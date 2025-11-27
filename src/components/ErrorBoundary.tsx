'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
          <motion.div
            className="max-w-md mx-auto text-center p-8"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <motion.div
              className="mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <motion.div
                className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.3, type: "spring", damping: 15 }}
              >
                <motion.svg
                  className="w-10 h-10 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </motion.svg>
              </motion.div>
            </motion.div>

            <motion.h1
              className="text-2xl font-bold text-gray-900 mb-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              哎呀，出现了问题
            </motion.h1>

            <motion.p
              className="text-gray-600 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              应用遇到了意外错误，别担心，您的数据是安全的。请尝试刷新页面重试。
            </motion.p>

            <motion.button
              onClick={() => window.location.reload()}
              className="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-8 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-medium shadow-lg hover:shadow-xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              刷新页面
            </motion.button>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <motion.details
                className="mt-6 text-left"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                  查看错误详情 (开发模式)
                </summary>
                <pre className="mt-2 text-xs bg-gray-100 p-3 rounded-lg overflow-auto text-red-600">
                  {this.state.error.stack}
                </pre>
              </motion.details>
            )}
          </motion.div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary