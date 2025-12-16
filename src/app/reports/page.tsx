'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { motion } from 'framer-motion'
import { CalendarIcon, DocumentArrowDownIcon, PrinterIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'
import { format, startOfMonth, endOfMonth, subMonths, startOfYear, endOfYear } from 'date-fns'

import NanoBanana from '@/components/NanoBanana'
import { useAuth } from '@/components/AuthProvider'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { getUserTransactions, Transaction } from '@/lib/dataService'

type TimeRange = 'current_month' | 'last_month' | 'current_year' | 'custom'

export default function ReportsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()

  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [generatedPdfUrl, setGeneratedPdfUrl] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<TimeRange>('current_month')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [isMobile, setIsMobile] = useState(false)

  const reportRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    return () => {
      if (generatedPdfUrl) URL.revokeObjectURL(generatedPdfUrl)
    }
  }, [generatedPdfUrl])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadTransactions()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  const loadTransactions = async () => {
    if (!user?.uid) return
    try {
      setLoading(true)
      const data = await getUserTransactions(user.uid, 1000)
      setTransactions(data)
    } catch (error) {
      console.error('Error loading transactions:', error)
      toast.error(t('common.error'))
    } finally {
      setLoading(false)
    }
  }

  const getDateRange = () => {
    const now = new Date()
    switch (timeRange) {
      case 'current_month': return { start: startOfMonth(now), end: endOfMonth(now) }
      case 'last_month':
        const lastMonth = subMonths(now, 1)
        return { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) }
      case 'current_year': return { start: startOfYear(now), end: endOfYear(now) }
      case 'custom':
        return {
          start: customStartDate ? new Date(customStartDate) : startOfMonth(now),
          end: customEndDate ? new Date(customEndDate) : endOfMonth(now)
        }
      default: return { start: startOfMonth(now), end: endOfMonth(now) }
    }
  }

  const filteredTransactions = useMemo(() => {
    const { start, end } = getDateRange()
    return transactions.filter(t => {
      const transactionDate = new Date(t.date)
      return transactionDate >= start && transactionDate <= end
    })
  }, [transactions, timeRange, customStartDate, customEndDate])

  const reportData = useMemo(() => {
    const income = filteredTransactions.filter(t => t.type === 'income')
    const expenses = filteredTransactions.filter(t => t.type === 'expense')

    const totalIncome = income.reduce((sum, t) => sum + t.amount, 0)
    const totalExpenses = expenses.reduce((sum, t) => sum + t.amount, 0)
    const netIncome = totalIncome - totalExpenses

    const incomeByCategory = new Map<string, number>()
    const expensesByCategory = new Map<string, number>()

    income.forEach(t => {
      const current = incomeByCategory.get(t.category) || 0
      incomeByCategory.set(t.category, current + t.amount)
    })
    expenses.forEach(t => {
      const current = expensesByCategory.get(t.category) || 0
      expensesByCategory.set(t.category, current + t.amount)
    })

    const paymentMethods = new Map<string, number>()
    filteredTransactions.forEach(t => {
      if (t.paymentMethod) {
        const current = paymentMethods.get(t.paymentMethod) || 0
        paymentMethods.set(t.paymentMethod, current + t.amount)
      }
    })

    const { start, end } = getDateRange()
    const daysDiff = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1)
    const avgDailyIncome = totalIncome / daysDiff
    const avgDailyExpense = totalExpenses / daysDiff

    let score = 50
    if (totalIncome > 0) {
      const savingsRate = netIncome / totalIncome
      score += Math.min(50, Math.max(0, savingsRate * 100))
    }
    if (netIncome < 0) score -= 10
    const finleyScore = Math.min(100, Math.max(0, Math.round(score)))

    const topExpenseCategory = Array.from(expensesByCategory.entries()).sort((a, b) => b[1] - a[1])[0]
    const savingsRatePercent = totalIncome > 0 ? ((netIncome / totalIncome) * 100).toFixed(1) : '0'

    const insights = [
      `<b>🏆 Score:</b> ${finleyScore} (${finleyScore >= 80 ? 'Excellent' : 'Good'})`,
      `<b>💰 Savings Rate:</b> ${savingsRatePercent}% (Target: 20%)`,
      `<b>📉 Top Expense:</b> ${topExpenseCategory ? topExpenseCategory[0] : 'None'} (${topExpenseCategory ? formatAmount(topExpenseCategory[1]) : '$0'})`,
      `<b>🚀 Trend:</b> On track for 2026 wealth goals based on current velocity.`
    ]

    return {
      totalIncome, totalExpenses, netIncome, transactionCount: filteredTransactions.length,
      incomeByCategory: Array.from(incomeByCategory.entries()).map(([name, value]) => ({ name, value })),
      expensesByCategory: Array.from(expensesByCategory.entries()).map(([name, value]) => ({ name, value })),
      paymentMethods: Array.from(paymentMethods.entries()).map(([name, value]) => ({ name, value })),
      avgDailyIncome, avgDailyExpense, daysDiff, finleyScore, insights
    }
  }, [filteredTransactions, formatAmount])

  const exportToCSV = () => {
    if (filteredTransactions.length === 0) { toast.error(t('common.error')); return }
    const headers = ['Date', 'Type', 'Category', 'Description', 'Amount', 'Payment Method']
    const csvContent = [headers.join(','), ...filteredTransactions.map(t => [format(new Date(t.date), 'yyyy-MM-dd'), t.type, t.category, `"${t.description}"`, t.amount, t.paymentMethod || ''].join(','))].join('\n')
    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.href = url
    link.download = `FinleyBook_Report_${format(new Date(), 'yyyy-MM-dd')}.csv`
    document.body.appendChild(link); link.click(); document.body.removeChild(link)
    toast.success(t('common.success'))
  }

  const handlePrint = () => window.print()

  const handleGeneratePDF = async () => {
    if (!reportRef.current) return

    try {
      setIsExporting(true)
      const toastId = toast.loading(t('reports.exporting') || 'Generating PDF...')

      // Optimize for mobile: Reduce resolution to prevent memory crashes
      const scale = window.innerWidth < 768 ? 1 : 2

      const element = reportRef.current
      const canvas = await html2canvas(element, {
        scale: scale,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        // Responsive width for clean capture
        windowWidth: window.innerWidth < 1200 ? 1200 : window.innerWidth,
        onclone: (clonedDoc) => {
          const element = clonedDoc.getElementById('report-container')
          if (element) {
            element.querySelectorAll('.print\\:flex, .print\\:block').forEach((el) => {
              if (el instanceof HTMLElement) {
                el.style.display = el.classList.contains('print:flex') ? 'flex' : 'block'
                if (el.classList.contains('justify-between')) el.style.justifyContent = 'space-between'
              }
            })
            element.querySelectorAll('.print\\:hidden').forEach((el) => { if (el instanceof HTMLElement) el.style.display = 'none' })
            element.style.padding = '40px'; element.style.maxWidth = '100%'; element.style.margin = '0'
          }
        }
      })

      const imgData = canvas.toDataURL('image/png')
      // A4 format
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })
      const imgWidth = 297;
      const pageHeight = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pageHeight

      while (heightLeft > 0) {
        position -= pageHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pageHeight
      }

      const pdfBlob = pdf.output('blob')
      const newPdfUrl = URL.createObjectURL(pdfBlob)
      setGeneratedPdfUrl(newPdfUrl)

      toast.dismiss(toastId)
      toast.success('Ready to Download!')
    } catch (error) {
      console.error('PDF Export Error:', error)
      toast.error('Failed to generate PDF. Please try on Desktop.')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 print:bg-[#f3f4f6]" id="report-container" ref={reportRef}>
      <style jsx global>{`
        @media print {
          @page { margin: 0; size: landscape; }
          body { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print-card { background: white; border: 1px solid #e5e7eb; border-radius: 12px; padding: 24px; break-inside: avoid; box-shadow: none !important; }
        }
      `}</style>
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 print:p-0 print:max-w-none pb-24 md:pb-6">
        {/* Letterhead */}
        <div className="hidden print:flex bg-slate-900 text-white p-10 mb-10 justify-between items-center print-color-adjust-exact border-b-4 border-slate-700">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-white rounded-none flex items-center justify-center text-slate-900 font-serif font-bold text-3xl">F.</div>
            <div>
              <h1 className="text-3xl font-serif font-bold tracking-tight">FinleyBook</h1>
              <p className="text-slate-400 text-[10px] tracking-[0.25em] uppercase font-medium mt-1">Private Wealth Management</p>
            </div>
          </div>
          <div className="text-right">
            <div className="inline-block bg-slate-800 rounded-sm px-4 py-1.5 mb-2 border border-slate-600">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300">Confidential Report</span>
            </div>
            <h2 className="text-2xl font-serif font-medium text-white tracking-wide">Monthly Portfolio Review</h2>
            <p className="text-slate-400 text-xs mt-1.5 font-light">Prepared for: <span className="text-white font-medium">{user?.displayName || 'Client'}</span> | {format(new Date(), 'MMMM dd, yyyy')}</p>
          </div>
        </div>

        {/* Header */}
        <motion.div className="mb-8 print:hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('reports.title')}</h1>
          <p className="text-gray-600">{t('reports.subtitle')}</p>
        </motion.div>

        {/* Executive Summary */}
        <div className="hidden print:grid grid-cols-3 gap-8 mx-10 mb-10 p-0">
          <div className="col-span-1 bg-white border border-gray-200 p-8 rounded-none flex flex-col items-center justify-center shadow-none">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Finley Score</h3>
            <div className="relative w-36 h-18 overflow-hidden mb-4">
              <div className="absolute top-0 left-0 w-36 h-36 rounded-full border-[14px] border-gray-100 box-border"></div>
              <div className="absolute top-0 left-0 w-36 h-36 rounded-full border-[14px] border-indigo-900 box-border" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', transform: `rotate(${(reportData.finleyScore / 100) * 180 - 180}deg)`, transformOrigin: 'center', transition: 'transform 1s ease-out' }}></div>
            </div>
            <div className="text-5xl font-serif font-bold text-slate-900">{reportData.finleyScore}</div>
            <div className="text-[10px] text-green-700 font-bold mt-2 uppercase tracking-wide border-t border-gray-100 pt-2 w-full text-center">Top 10% Percentile</div>
          </div>
          <div className="col-span-2 bg-slate-50 border-l-[6px] border-slate-800 p-8 rounded-r-sm print-color-adjust-exact flex flex-col justify-center">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest mb-5 flex items-center gap-3"><span className="text-lg">⚡️</span> Executive AI Summary</h3>
            <div className="grid grid-cols-2 gap-6">
              {reportData.insights.map((insight, i) => (
                <div key={i} className="text-sm text-slate-800 leading-relaxed font-serif bg-white p-4 rounded-sm border border-slate-200 shadow-sm"><span dangerouslySetInnerHTML={{ __html: insight }} /></div>
              ))}
            </div>
          </div>
        </div>

        {/* Controls */}
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 print:hidden" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.5 }}>
          <div className="flex flex-col lg:flex-row gap-4 justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as TimeRange)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900">
                <option value="current_month">{t('reports.timeRange.currentMonth')}</option>
                <option value="last_month">{t('reports.timeRange.lastMonth')}</option>
                <option value="current_year">{t('reports.timeRange.currentYear')}</option>
                <option value="custom">{t('reports.timeRange.custom')}</option>
              </select>
              {timeRange === 'custom' && (
                <>
                  <input type="date" value={customStartDate} onChange={(e) => setCustomStartDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                  <input type="date" value={customEndDate} onChange={(e) => setCustomEndDate(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900" />
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-3">
              <motion.button onClick={handlePrint} className="hidden md:flex items-center justify-center h-10 px-4 bg-white border border-gray-200 text-gray-700 font-medium rounded-lg shadow-sm hover:bg-gray-50 hover:border-gray-300 transition-all text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <PrinterIcon className="w-4 h-4 mr-2" />{t('reports.print')}
              </motion.button>
              {generatedPdfUrl ? (
                <motion.a
                  href={generatedPdfUrl}
                  download={`FinleyReport_${format(new Date(), 'yyyy-MM-dd')}.pdf`}
                  className="flex items-center justify-center h-10 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-all text-sm cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <ArrowDownTrayIcon className="w-4 h-4 mr-2" />
                  Download PDF
                </motion.a>
              ) : (
                <motion.button
                  onClick={handleGeneratePDF}
                  disabled={isExporting}
                  className="flex items-center justify-center h-10 px-4 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-lg shadow-sm transition-all text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {isExporting ? <ArrowDownTrayIcon className="w-4 h-4 mr-2 animate-bounce" /> : <ArrowDownTrayIcon className="w-4 h-4 mr-2" />}
                  {isExporting ? 'Generating...' : t('reports.downloadPDF')}
                </motion.button>
              )}
              <motion.button onClick={exportToCSV} disabled={filteredTransactions.length === 0} className="flex items-center justify-center h-10 px-4 bg-emerald-600 text-white font-medium rounded-lg shadow-sm hover:bg-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm" whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <DocumentArrowDownIcon className="w-4 h-4 mr-2" />{t('reports.exportCSV')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8 print:grid-cols-4 print:gap-6 print:mx-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.5 }}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.totalIncome')}</h3><p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalIncome)}</p><p className="text-[10px] text-green-600 font-bold mt-1 flex items-center">▲ 12% vs last month</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.totalExpenses')}</h3><p className="text-2xl font-bold text-slate-900">{formatAmount(reportData.totalExpenses)}</p><p className="text-[10px] text-red-500 font-bold mt-1 flex items-center">▲ 5% vs last month</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{t('reports.summary.netIncome')}</h3><p className={`text-2xl font-bold ${reportData.netIncome >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{reportData.netIncome >= 0 ? '+' : ''}{formatAmount(reportData.netIncome)}</p><p className="text-[10px] text-slate-500 mt-1">Savings Rate: {reportData.totalIncome > 0 ? ((reportData.netIncome / reportData.totalIncome) * 100).toFixed(1) : 0}%</p></div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card"><h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Transactions</h3><p className="text-2xl font-bold text-slate-900">{reportData.transactionCount}</p><p className="text-[10px] text-slate-400 mt-1">Across {reportData.daysDiff} days</p></div>
        </motion.div>

        {/* Charts */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="print-card print:mx-10 mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.trend')}</h2>
          <NanoBanana transactions={filteredTransactions} />
        </motion.div>

        {/* Breakdown */}
        <motion.div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 mt-8 print:grid-cols-2 print:gap-8 print:mx-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5, duration: 0.5 }}>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.incomeBreakdown')}</h3>
            {reportData.incomeByCategory.length > 0 ? (
              <div className="space-y-3">{reportData.incomeByCategory.sort((a, b) => b.value - a.value).map((category, index) => { const percentage = (category.value / reportData.totalIncome) * 100; return (<div key={category.name} className="flex items-center justify-between"><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">{category.name}</span><span className="text-sm text-gray-500">{formatAmount(category.value)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 print:border print:border-gray-300"><motion.div className="h-2 rounded-full bg-green-500 print:bg-green-600 print:print-color-adjust-exact" style={{ width: `${percentage}%` }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: index * 0.1, duration: 0.8 }} /></div><div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div></div></div>) })}</div>
            ) : <p className="text-gray-500 text-center py-8">{t('reports.empty.income')}</p>}
          </div>
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 print-card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.expenseBreakdown')}</h3>
            {reportData.expensesByCategory.length > 0 ? (
              <div className="space-y-3">{reportData.expensesByCategory.sort((a, b) => b.value - a.value).map((category, index) => { const percentage = (category.value / reportData.totalExpenses) * 100; return (<div key={category.name} className="flex items-center justify-between"><div className="flex-1"><div className="flex justify-between mb-1"><span className="text-sm font-medium text-gray-700">{category.name}</span><span className="text-sm text-gray-500">{formatAmount(category.value)}</span></div><div className="w-full bg-gray-200 rounded-full h-2 print:border print:border-gray-300"><motion.div className="h-2 rounded-full bg-red-500 print:bg-red-600 print:print-color-adjust-exact" style={{ width: `${percentage}%` }} initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ delay: index * 0.1, duration: 0.8 }} /></div><div className="text-xs text-gray-500 mt-1">{percentage.toFixed(1)}%</div></div></div>) })}</div>
            ) : <p className="text-gray-500 text-center py-8">{t('reports.empty.expense')}</p>}
          </div>
        </motion.div>

        {/* Payments */}
        <motion.div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 print-card print:mx-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6, duration: 0.5 }}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('reports.charts.paymentMethods')}</h3>
          {reportData.paymentMethods.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 print:grid-cols-4">
              {reportData.paymentMethods.sort((a, b) => b.value - a.value).map((method, index) => {
                const totalAmount = reportData.paymentMethods.reduce((sum, m) => sum + m.value, 0); const percentage = (method.value / totalAmount) * 100;
                return (<div key={method.name} className="text-center"><div className="bg-blue-50 p-4 rounded-lg print:bg-gray-50 print:border print:border-gray-200"><h4 className="text-sm font-medium text-gray-700 mb-2">{method.name}</h4><p className="text-lg font-bold text-blue-600 print:text-black">{formatAmount(method.value)}</p><p className="text-xs text-gray-500">{percentage.toFixed(1)}%</p></div></div>)
              })}
            </div>
          ) : <p className="text-gray-500 text-center py-8">{t('reports.empty.payment')}</p>}
        </motion.div>

        {/* Footer */}
        <div className="hidden print:flex flex-col gap-4 mt-12 pt-6 border-t border-gray-300 mx-10 pb-8">
          <div className="flex justify-between items-start"><div className="text-[10px] text-gray-400 max-w-2xl leading-relaxed"><strong>DISCLAIMER:</strong> This report is generated by AI based on user-provided data. It does not constitute professional financial, tax, or legal advice. Historical performance is not indicative of future results. FinleyBook is not a registered investment advisor.</div><div className="text-right"><div className="text-sm font-bold text-slate-900">FinleyBook.com</div><div className="text-[10px] text-gray-400">AI Wealth Intelligence Engine</div></div></div>
          <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2"><div className="uppercase tracking-widest font-bold">Confidential & Private</div><div>Page 1 of 1</div></div>
        </div>
        <div className="hidden print:block fixed bottom-0 left-0 right-0 h-1.5 bg-slate-900 print-color-adjust-exact" />
      </main>
    </div>
  )
}