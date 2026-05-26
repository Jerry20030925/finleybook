'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { PlusIcon, PencilIcon, TrashIcon, MagnifyingGlassIcon, CheckIcon, SparklesIcon } from '@heroicons/react/24/outline'

import { useAuth } from '@/components/AuthProvider'
import { getUserTransactions, DEFAULT_CATEGORIES, getBudgets, addBudget, updateBudget, deleteBudget, type Budget } from '@/lib/dataService'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'



// Mapping from Chinese category names (stored in DB) to translation keys
const CATEGORY_MAPPING: { [key: string]: string } = {
  '餐饮美食': 'category.food',
  '交通出行': 'category.transport',
  '购物消费': 'category.shopping',
  '居住缴费': 'category.housing',
  '医疗健康': 'category.health',
  '文化娱乐': 'category.entertainment',
  '学习教育': 'category.education',
  '其他支出': 'category.otherExpense',
  '工资收入': 'category.salary',
  '投资收益': 'category.investment',
  '兼职收入': 'category.parttime',
  '其他收入': 'category.otherIncome'
}

import { useRouter } from 'next/navigation'

type BudgetTemplate = {
  id: string
  name: string
  category: string
  amount: number
  period: 'monthly' | 'yearly'
}

const BUDGET_TEMPLATES_STORAGE_KEY = 'finleybook.budgetTemplates.v1'

export default function BudgetPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const router = useRouter()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedBudgetIds, setSelectedBudgetIds] = useState<string[]>([])
  const [bulkAdjustMode, setBulkAdjustMode] = useState<'percent' | 'set'>('percent')
  const [bulkAdjustValue, setBulkAdjustValue] = useState('')
  const [bulkApplying, setBulkApplying] = useState(false)
  const [showTemplateCenter, setShowTemplateCenter] = useState(false)
  const [templateQuery, setTemplateQuery] = useState('')
  const [templates, setTemplates] = useState<BudgetTemplate[]>([])
  const [confirmClearTemplates, setConfirmClearTemplates] = useState(false)

  const [formData, setFormData] = useState({
    category: '',
    amount: '',
    period: 'monthly' as 'monthly' | 'yearly'
  })
  const searchInputRef = useRef<HTMLInputElement | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (user) {
      loadBudgets()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(BUDGET_TEMPLATES_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw) as BudgetTemplate[]
      if (Array.isArray(parsed)) {
        setTemplates(parsed)
      }
    } catch (error) {
      console.warn('Failed to load budget templates', error)
    }
  }, [])

  const loadBudgets = async () => {
    if (!user?.uid) return

    try {
      setLoading(true)

      // 1. Fetch Budgets (Real Data)
      const fetchedBudgets = await getBudgets(user.uid)

      // 2. Fetch Transactions for calculation (Real Data)
      const transactions = await getUserTransactions(user.uid, 1000)

      // Get current month/year for monthly calculations
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      // Calculate spent amounts by category
      const spentByCategory = new Map<string, number>()

      transactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          const transactionDate = new Date(transaction.date)
          const transactionMonth = transactionDate.getMonth()
          const transactionYear = transactionDate.getFullYear()

          // Only include current month expenses
          if (transactionMonth === currentMonth && transactionYear === currentYear) {
            // Normalize category if needed (assuming DB stores localized string or key)
            // We match directly for now as simple string match
            const current = spentByCategory.get(transaction.category) || 0
            spentByCategory.set(transaction.category, current + transaction.amount)
          }
        }
      })

      // Merge budgets with calculated spent
      const budgetsWithSpent = fetchedBudgets.map(b => ({
        ...b,
        spent: spentByCategory.get(b.category) || 0
      }))

      setBudgets(budgetsWithSpent)
    } catch (error) {
      console.error('Error loading budgets:', error)
      toast.error(t('budget.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.uid) return
    if (!formData.category || !formData.amount) {
      toast.error(t('budget.fillComplete'))
      return
    }

    try {
      if (editingBudget && editingBudget.id) {
        await updateBudget(editingBudget.id, {
          category: formData.category,
          amount: parseFloat(formData.amount),
          period: formData.period
        })
        toast.success(t('budget.updateSuccess'))
      } else {
        await addBudget({
          userId: user.uid,
          category: formData.category,
          amount: parseFloat(formData.amount),
          period: formData.period
        })
        toast.success(t('budget.addSuccess'))
      }

      // Reload to reflect changes
      await loadBudgets()

      closeBudgetModal()
    } catch (error) {
      console.error('Error saving budget:', error)
      toast.error(t('budget.error'))
    }
  }

  const handleEdit = (budget: Budget) => {
    setEditingBudget(budget)
    setFormData({
      category: budget.category,
      amount: budget.amount.toString(),
      period: budget.period
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteBudget(id)
      toast.success(t('budget.deleteSuccess'))
      setDeleteConfirmId(null)
      await loadBudgets()
    } catch (error) {
      console.error('Error deleting budget:', error)
      toast.error(t('budget.error'))
    }
  }

  const closeBudgetModal = useCallback(() => {
    setShowModal(false)
    setEditingBudget(null)
    setFormData({ category: '', amount: '', period: 'monthly' })
  }, [])

  const persistTemplates = useCallback((next: BudgetTemplate[]) => {
    setTemplates(next)
    if (typeof window !== 'undefined') {
      try {
        window.localStorage.setItem(BUDGET_TEMPLATES_STORAGE_KEY, JSON.stringify(next))
      } catch (error) {
        console.warn('Failed to persist budget templates', error)
      }
    }
  }, [])

  const createTemplateFromForm = () => {
    if (!formData.category || !formData.amount) {
      toast.error('Complete category and amount first')
      return
    }
    const amount = Number(formData.amount)
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error('Enter a valid amount')
      return
    }
    const template: BudgetTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name: `${getCategoryName(formData.category)} ${formData.period === 'monthly' ? 'Monthly' : 'Yearly'}`,
      category: formData.category,
      amount,
      period: formData.period
    }
    persistTemplates([template, ...templates].slice(0, 20))
    toast.success('Budget template saved')
  }

  const applyTemplateToForm = (template: BudgetTemplate) => {
    setFormData({
      category: template.category,
      amount: String(template.amount),
      period: template.period
    })
    setShowModal(true)
    setShowTemplateCenter(false)
  }

  const removeTemplate = (id: string) => {
    persistTemplates(templates.filter((template) => template.id !== id))
  }

  const clearTemplates = () => {
    persistTemplates([])
    setConfirmClearTemplates(false)
    toast.success('Budget templates cleared')
  }

  const getCategoryName = useCallback((category: string) => {
    if (category.startsWith('category.')) return t(category)
    const key = CATEGORY_MAPPING[category]
    return key ? t(key) : category
  }, [t])

  const filteredBudgets = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) return budgets
    return budgets.filter((budget) => {
      const categoryName = getCategoryName(budget.category).toLowerCase()
      return categoryName.includes(query) || budget.category.toLowerCase().includes(query)
    })
  }, [budgets, searchQuery, getCategoryName])

  const totalBudget = filteredBudgets.reduce((sum, b) => sum + b.amount, 0)
  const totalSpent = filteredBudgets.reduce((sum, b) => sum + b.spent, 0)

  const selectedCount = selectedBudgetIds.length
  const selectedBudgets = useMemo(() => {
    const ids = new Set(selectedBudgetIds)
    return budgets.filter((budget) => budget.id && ids.has(budget.id))
  }, [budgets, selectedBudgetIds])

  const toggleBudgetSelected = (budgetId?: string) => {
    if (!budgetId) return
    setSelectedBudgetIds((prev) => prev.includes(budgetId)
      ? prev.filter((id) => id !== budgetId)
      : [...prev, budgetId]
    )
  }

  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = filteredBudgets.map((b) => b.id).filter(Boolean) as string[]
    if (visibleIds.length === 0) return
    const allSelected = visibleIds.every((id) => selectedBudgetIds.includes(id))
    setSelectedBudgetIds((prev) => {
      if (allSelected) return prev.filter((id) => !visibleIds.includes(id))
      return Array.from(new Set([...prev, ...visibleIds]))
    })
  }, [filteredBudgets, selectedBudgetIds])

  const resetSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedBudgetIds([])
    setBulkAdjustValue('')
    setBulkAdjustMode('percent')
  }, [])

  const parsedBulkAdjustValue = useMemo(() => {
    const value = Number(bulkAdjustValue)
    return Number.isFinite(value) ? value : null
  }, [bulkAdjustValue])

  const bulkImpactPreview = useMemo(() => {
    if (selectedBudgets.length === 0 || parsedBulkAdjustValue == null) return null
    const beforeTotal = selectedBudgets.reduce((sum, budget) => sum + budget.amount, 0)
    const afterTotal = selectedBudgets.reduce((sum, budget) => {
      if (bulkAdjustMode === 'set') return sum + Math.max(0, parsedBulkAdjustValue)
      return sum + Math.max(0, budget.amount * (1 + parsedBulkAdjustValue / 100))
    }, 0)
    const delta = afterTotal - beforeTotal
    const overallBudgetBefore = budgets.reduce((sum, b) => sum + b.amount, 0)
    const overallBudgetAfter = overallBudgetBefore - beforeTotal + afterTotal
    const remainingBefore = overallBudgetBefore - budgets.reduce((sum, b) => sum + b.spent, 0)
    const remainingAfter = overallBudgetAfter - budgets.reduce((sum, b) => sum + b.spent, 0)
    return {
      beforeTotal,
      afterTotal,
      delta,
      remainingDelta: remainingAfter - remainingBefore
    }
  }, [selectedBudgets, parsedBulkAdjustValue, bulkAdjustMode, budgets])

  const applyBulkAdjustments = async () => {
    if (selectedBudgets.length === 0) return
    if (parsedBulkAdjustValue == null) {
      toast.error('Enter a valid bulk adjustment value')
      return
    }
    try {
      setBulkApplying(true)
      await Promise.all(
        selectedBudgets.map((budget) => {
          if (!budget.id) return Promise.resolve()
          const nextAmount = bulkAdjustMode === 'set'
            ? Math.max(0, parsedBulkAdjustValue)
            : Math.max(0, budget.amount * (1 + parsedBulkAdjustValue / 100))
          return updateBudget(budget.id, { amount: Number(nextAmount.toFixed(2)) })
        })
      )
      toast.success(`Updated ${selectedBudgets.length} budget${selectedBudgets.length > 1 ? 's' : ''}`)
      await loadBudgets()
      resetSelectionMode()
    } catch (error) {
      console.error('Bulk budget update failed:', error)
      toast.error('Failed to apply bulk budget changes')
    } finally {
      setBulkApplying(false)
    }
  }

  const templateList = useMemo(() => {
    const query = templateQuery.trim().toLowerCase()
    return templates.filter((template) => {
      if (!query) return true
      return template.name.toLowerCase().includes(query)
        || template.category.toLowerCase().includes(query)
        || getCategoryName(template.category).toLowerCase().includes(query)
    })
  }, [templates, templateQuery, getCategoryName])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping = !!target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
      const meta = event.metaKey || event.ctrlKey

      if (meta && event.key.toLowerCase() === 'a' && selectionMode) {
        event.preventDefault()
        toggleSelectAllVisible()
        return
      }

      if (isTyping) return

      if (event.key === '/') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault()
        setEditingBudget(null)
        setShowModal(true)
        return
      }
      if (event.key.toLowerCase() === 's' && !meta) {
        event.preventDefault()
        if (selectionMode) resetSelectionMode()
        else setSelectionMode(true)
        return
      }
      if (event.key.toLowerCase() === 'r' && !meta) {
        event.preventDefault()
        setShowTemplateCenter((prev) => !prev)
        return
      }
      if (event.key === 'Escape') {
        setDeleteConfirmId(null)
        setConfirmClearTemplates(false)
        if (showModal) closeBudgetModal()
        if (selectionMode) resetSelectionMode()
        if (showTemplateCenter) setShowTemplateCenter(false)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [selectionMode, showModal, showTemplateCenter, resetSelectionMode, toggleSelectAllVisible, closeBudgetModal])

  const getProgressColor = (spent: number, budget: number) => {
    const percentage = (spent / budget) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="min-h-screen bg-gray-50">


      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-24">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('budget.title')}</h1>
          <p className="text-gray-600">{t('budget.description')}</p>
          <p className="text-xs text-slate-500 mt-2">
            Shortcuts: `/` search, `N` new budget, `S` selection mode, `R` template center
          </p>
        </motion.div>

        <motion.div
          className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
        >
          <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search budgets by category..."
                className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-gray-300 text-sm text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-gray-400 border border-gray-200 rounded px-1.5 py-0.5">/</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setSelectionMode((prev) => {
                  if (prev) {
                    resetSelectionMode()
                    return false
                  }
                  return true
                })}
                className={`min-h-[40px] px-3 rounded-lg border text-sm font-medium ${selectionMode ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-700'}`}
              >
                {selectionMode ? `Done (${selectedCount})` : 'Select'}
              </button>
              <button
                type="button"
                onClick={() => setShowTemplateCenter((prev) => !prev)}
                className={`min-h-[40px] px-3 rounded-lg border text-sm font-medium inline-flex items-center gap-1.5 ${showTemplateCenter ? 'border-emerald-300 bg-emerald-50 text-emerald-700' : 'border-gray-300 bg-white text-gray-700'}`}
              >
                <SparklesIcon className="w-4 h-4" />
                Templates
              </button>
            </div>
          </div>
        </motion.div>

        {showTemplateCenter && (
          <motion.div
            className="mb-6 rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-col md:flex-row gap-3 md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Budget Template Center</h2>
                <p className="text-xs text-slate-500">Save and reuse your common budget setups.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full border border-slate-200 bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600">
                  {templates.length} templates
                </span>
                <button
                  type="button"
                  onClick={() => {
                    if (!confirmClearTemplates) {
                      setConfirmClearTemplates(true)
                      return
                    }
                    clearTemplates()
                  }}
                  disabled={templates.length === 0}
                  className={`min-h-[36px] px-3 rounded-lg border text-xs font-medium disabled:opacity-50 ${confirmClearTemplates ? 'border-red-400 bg-red-600 text-white' : 'border-gray-300 bg-white text-gray-700'}`}
                >
                  {confirmClearTemplates ? 'Confirm Clear' : 'Clear All'}
                </button>
              </div>
            </div>
            <div className="mt-3">
              <input
                value={templateQuery}
                onChange={(e) => setTemplateQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full md:max-w-md px-3 py-2 rounded-lg border border-gray-300 text-sm text-gray-900"
              />
            </div>
            <div className="mt-3 space-y-2 max-h-72 overflow-y-auto">
              {templateList.length === 0 ? (
                <div className="rounded-lg border border-dashed border-gray-300 bg-slate-50 p-4 text-center">
                  <p className="text-sm font-medium text-slate-700">No templates yet</p>
                  <p className="text-xs text-slate-500 mt-1">Create one from the budget modal.</p>
                </div>
              ) : (
                templateList.slice(0, 30).map((template) => (
                  <div key={template.id} className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                      <p className="text-xs text-slate-500">
                        {getCategoryName(template.category)} · {template.period} · {formatAmount(template.amount)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => applyTemplateToForm(template)}
                        className="min-h-[34px] px-2.5 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-indigo-700"
                      >
                        Apply
                      </button>
                      <button
                        type="button"
                        onClick={() => removeTemplate(template.id)}
                        className="min-h-[34px] px-2.5 rounded-lg border border-gray-200 bg-white text-xs font-medium text-gray-700"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}

        {selectionMode && (
          <motion.div
            className="mb-6 rounded-xl border border-indigo-200 bg-indigo-50/70 p-4"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <p className="text-sm font-semibold text-indigo-900">Bulk Budget Adjustments</p>
                <p className="text-xs text-indigo-700/80">{selectedCount} selected budget{selectedCount !== 1 ? 's' : ''}</p>
              </div>
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="min-h-[36px] px-3 rounded-lg border border-indigo-200 bg-white text-xs font-medium text-indigo-700"
              >
                Select / Unselect Visible
              </button>
            </div>
            <div className="mt-3 grid grid-cols-1 md:grid-cols-[180px_1fr_auto] gap-2">
              <select
                value={bulkAdjustMode}
                onChange={(e) => setBulkAdjustMode(e.target.value as 'percent' | 'set')}
                className="min-h-[40px] px-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
              >
                <option value="percent">Adjust by %</option>
                <option value="set">Set exact amount</option>
              </select>
              <input
                value={bulkAdjustValue}
                onChange={(e) => setBulkAdjustValue(e.target.value)}
                placeholder={bulkAdjustMode === 'percent' ? 'e.g. 10 or -5' : 'e.g. 1200'}
                className="min-h-[40px] px-3 rounded-lg border border-gray-300 text-sm text-gray-900 bg-white"
              />
              <button
                type="button"
                onClick={applyBulkAdjustments}
                disabled={selectedCount === 0 || parsedBulkAdjustValue == null || bulkApplying}
                className="min-h-[40px] px-4 rounded-lg bg-indigo-600 text-white text-sm font-medium disabled:opacity-50"
              >
                Apply
              </button>
            </div>
            {bulkImpactPreview && (
              <div className="mt-3 rounded-xl border border-indigo-100 bg-white p-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Impact Preview</p>
                <div className="mt-2 grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-[11px] text-slate-500">Selected Total</p>
                    <p className="text-sm font-semibold text-slate-900">{formatAmount(bulkImpactPreview.beforeTotal)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-[11px] text-slate-500">After Change</p>
                    <p className="text-sm font-semibold text-slate-900">{formatAmount(bulkImpactPreview.afterTotal)}</p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-[11px] text-slate-500">Budget Delta</p>
                    <p className={`text-sm font-semibold ${bulkImpactPreview.delta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {bulkImpactPreview.delta >= 0 ? '+' : ''}{formatAmount(bulkImpactPreview.delta)}
                    </p>
                  </div>
                  <div className="rounded-lg border border-slate-200 p-2 bg-slate-50">
                    <p className="text-[11px] text-slate-500">Remaining Delta</p>
                    <p className={`text-sm font-semibold ${bulkImpactPreview.remainingDelta >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                      {bulkImpactPreview.remainingDelta >= 0 ? '+' : ''}{formatAmount(bulkImpactPreview.remainingDelta)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {/* Summary Cards */}
        <motion.div
          className="flex gap-4 mb-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-1 md:grid md:grid-cols-3 md:overflow-visible"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.totalBudget')}</h3>
            <p className="text-2xl font-bold text-blue-600">{formatAmount(totalBudget)}</p>
          </div>
          <div className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.spent')}</h3>
            <p className="text-2xl font-bold text-red-600">{formatAmount(totalSpent)}</p>
          </div>
          <div className="min-w-[200px] flex-shrink-0 snap-start bg-white p-5 sm:p-6 rounded-xl shadow-sm border border-gray-100 md:min-w-0 md:flex-shrink">
            <h3 className="text-sm font-medium text-gray-500 mb-2">{t('budget.remainingBudget')}</h3>
            <p className={`text-2xl font-bold ${totalBudget - totalSpent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatAmount(totalBudget - totalSpent)}
            </p>
          </div>
        </motion.div>

        {/* Add Budget Button */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex flex-wrap items-center gap-2">
            <motion.button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              {t('budget.addBudget')}
            </motion.button>
            {selectionMode && (
              <button
                type="button"
                onClick={resetSelectionMode}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 text-sm font-medium bg-white"
              >
                Exit Selection
              </button>
            )}
          </div>
        </motion.div>

        {/* Budgets Grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {budgets.length === 0 && !loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-4">
                <PlusIcon className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">{t('budget.emptyTitle') || 'No Budgets Yet'}</h3>
              <p className="text-gray-500 mb-6 max-w-xs">{t('budget.emptyDesc') || 'Set monthly spending limits to track your savings goals.'}</p>
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition"
              >
                {t('budget.createFirst') || 'Create First Budget'}
              </button>
            </div>
          ) : filteredBudgets.length === 0 && !loading ? (
            <div className="col-span-full flex flex-col items-center justify-center py-12 text-center bg-white rounded-2xl border border-dashed border-gray-300">
              <div className="w-14 h-14 bg-slate-50 text-slate-500 rounded-full flex items-center justify-center mb-3">
                <MagnifyingGlassIcon className="w-7 h-7" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No budget matches</h3>
              <p className="text-gray-500 mb-4 max-w-xs">Try a different keyword or clear the search filter.</p>
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700"
              >
                Clear Search
              </button>
            </div>
          ) : (
            filteredBudgets.map((budget) => {
              const percentage = Math.min((budget.spent / budget.amount) * 100, 100)
              const isSelected = !!budget.id && selectedBudgetIds.includes(budget.id)
              return (
                <motion.div
                  key={budget.id}
                  className={`bg-white p-6 rounded-xl shadow-sm border ${isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}
                  variants={{
                    hidden: { opacity: 0, scale: 0.9 },
                    show: { opacity: 1, scale: 1 }
                  }}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-2">
                      {selectionMode && (
                        <button
                          type="button"
                          onClick={() => toggleBudgetSelected(budget.id)}
                          className={`mt-0.5 h-6 w-6 rounded-md border flex items-center justify-center transition-colors ${isSelected ? 'border-indigo-500 bg-indigo-500 text-white' : 'border-gray-300 bg-white text-transparent'}`}
                          aria-label={isSelected ? 'Deselect budget' : 'Select budget'}
                        >
                          <CheckIcon className="w-4 h-4" />
                        </button>
                      )}
                      <div>
                        <h3 className="text-lg font-medium text-gray-900">{getCategoryName(budget.category)}</h3>
                        <p className="text-xs text-gray-500 mt-0.5">{budget.period === 'monthly' ? t('budget.monthly') : t('budget.yearly')}</p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => budget.id && handleEdit(budget)}
                        className="p-2.5 text-gray-400 hover:text-blue-600 active:text-blue-700 transition-colors rounded-lg hover:bg-blue-50 active:bg-blue-100"
                      >
                        <PencilIcon className="w-5 h-5" />
                      </button>
                      {deleteConfirmId === budget.id ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => budget.id && handleDelete(budget.id)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg hover:bg-red-600 active:bg-red-700 transition-colors"
                          >
                            {t('common.confirm') || 'Yes'}
                          </button>
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors"
                          >
                            {t('common.cancel') || 'No'}
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => budget.id && setDeleteConfirmId(budget.id)}
                          className="p-2.5 text-gray-400 hover:text-red-600 active:text-red-700 transition-colors rounded-lg hover:bg-red-50 active:bg-red-100"
                        >
                          <TrashIcon className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{t('budget.spent')} {formatAmount(budget.spent)}</span>
                      <span>{t('budget.budgetAmount')} {formatAmount(budget.amount)}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getProgressColor(budget.spent, budget.amount)}`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {percentage.toFixed(1)}% {t('budget.used')}
                    </div>
                  </div>

                  <div className="text-sm">
                    <span className="text-gray-500">{t('budget.remaining')}</span>
                    <span className={budget.amount - budget.spent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {formatAmount(budget.amount - budget.spent)}
                    </span>
                  </div>
                  {selectionMode && (
                    <button
                      type="button"
                      onClick={() => toggleBudgetSelected(budget.id)}
                      className={`mt-3 w-full min-h-[38px] rounded-lg border text-xs font-medium ${isSelected ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-300 bg-white text-gray-700'}`}
                    >
                      {isSelected ? 'Selected' : 'Select for bulk adjust'}
                    </button>
                  )}
                </motion.div>
              )
            })
          )}
        </motion.div>

        {/* Add/Edit Budget Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-0 sm:items-center sm:p-4 text-center">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeBudgetModal} />

              <motion.div
                className="relative bg-white rounded-t-2xl sm:rounded-xl w-full sm:max-w-md mx-auto p-6 shadow-xl transform transition-all h-auto sm:h-auto"
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 500 }}
              >
                <div className="absolute top-2 left-1/2 transform -translate-x-1/2 w-12 h-1.5 bg-gray-300 rounded-full sm:hidden mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-6 sm:mb-4 text-left">
                  {editingBudget ? t('budget.edit') : t('budget.addBudget')}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.category')}
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-3 py-3 min-h-[44px] text-gray-900"
                      required
                    >
                      <option value="">{t('budget.selectCategory')}</option>
                      {DEFAULT_CATEGORIES.expense.map(category => (
                        <option key={category} value={category}>{getCategoryName(category)}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.budgetAmount')}
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="w-full border border-gray-300 rounded-xl px-3 py-3 min-h-[44px] text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('budget.period')}
                    </label>
                    <select
                      value={formData.period}
                      onChange={(e) => setFormData(prev => ({ ...prev, period: e.target.value as 'monthly' | 'yearly' }))}
                      className="w-full border border-gray-300 rounded-xl px-3 py-3 min-h-[44px] text-gray-900"
                    >
                      <option value="monthly">{t('budget.monthly')}</option>
                      <option value="yearly">{t('budget.yearly')}</option>
                    </select>
                  </div>

                  <div className="flex space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={createTemplateFromForm}
                      className="px-4 py-3 min-h-[44px] border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-100 active:bg-emerald-100 font-medium text-sm"
                    >
                      Save Template
                    </button>
                    <button
                      type="button"
                      onClick={closeBudgetModal}
                      className="flex-1 px-4 py-3 min-h-[44px] border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 active:bg-gray-100 font-medium"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-4 py-3 min-h-[44px] bg-blue-600 text-white rounded-xl hover:bg-blue-700 active:bg-blue-800 font-medium"
                    >
                      {editingBudget ? t('budget.update') : t('budget.addBudget')}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
