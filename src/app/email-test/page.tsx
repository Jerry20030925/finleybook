'use client'

import { useState } from 'react'
import { Send, Mail, CheckCircle, AlertCircle } from 'lucide-react'

export default function EmailTestPage() {
  const [email, setEmail] = useState('')
  const [type, setType] = useState('welcome')
  const [sending, setSending] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string; emailId?: string } | null>(null)

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    setSending(true)
    setResult(null)

    try {
      const response = await fetch('/api/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, type }),
      })

      const data = await response.json()
      
      if (response.ok) {
        setResult({
          success: true,
          message: '邮件发送成功！',
          emailId: data.emailId
        })
      } else {
        setResult({
          success: false,
          message: data.error || '邮件发送失败'
        })
      }
    } catch (error) {
      setResult({
        success: false,
        message: '网络错误，请重试'
      })
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <Mail className="h-12 w-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900">邮件发送测试</h1>
          <p className="text-gray-600 mt-2">测试 FinleyBook 的邮件功能</p>
        </div>

        <form onSubmit={handleSendEmail} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              邮箱地址
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="输入测试邮箱地址"
            />
          </div>

          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
              邮件类型
            </label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="welcome">欢迎邮件</option>
              <option value="notification">通知邮件</option>
              <option value="reset">密码重置邮件</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={sending || !email}
            className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {sending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                发送中...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                发送测试邮件
              </>
            )}
          </button>
        </form>

        {result && (
          <div className={`mt-6 p-4 rounded-md flex items-start gap-3 ${
            result.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
            )}
            <div>
              <p className="font-medium">{result.message}</p>
              {result.emailId && (
                <p className="text-sm mt-1 opacity-80">邮件ID: {result.emailId}</p>
              )}
            </div>
          </div>
        )}

        <div className="mt-8 text-center">
          <a 
            href="/"
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            ← 返回首页
          </a>
        </div>
      </div>
    </div>
  )
}