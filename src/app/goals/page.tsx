'use client'

import { useState, useEffect, useMemo, useCallback, useRef, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  MagnifyingGlassIcon,
  SparklesIcon,
  XMarkIcon,
  CalendarDaysIcon,
  TagIcon,
  Squares2X2Icon,
} from '@heroicons/react/24/outline'

import { useAuth } from '@/components/AuthProvider'
import toast from 'react-hot-toast'
import { useLanguage } from '@/components/LanguageProvider'
import { useCurrency } from '@/components/CurrencyProvider'
import { useExperience } from '@/components/ExperienceProvider'
import { Goal, addGoal, getGoals, updateGoal, deleteGoal } from '@/lib/dataService'

import { useRouter } from 'next/navigation'

type GoalStatusFilter = 'all' | 'active' | 'completed'
type GoalSortMode = 'deadlineSoon' | 'progressLow' | 'targetHigh' | 'recent'
type BulkGoalAction = 'progress' | 'category' | 'deadline'

type GoalTemplate = {
  id: string
  name: string
  title: string
  description: string
  targetAmount: string
  category: Goal['category']
  timelineDays: number
  createdAt: number
}

const GOAL_TEMPLATES_STORAGE_KEY = 'finleybook.goalTemplates.v1'

const EMPTY_FORM = {
  title: '',
  description: '',
  targetAmount: '',
  deadline: '',
  category: 'savings' as Goal['category']
}

function formatDateInput(date: Date) {
  const y = date.getFullYear()
  const m = `${date.getMonth() + 1}`.padStart(2, '0')
  const d = `${date.getDate()}`.padStart(2, '0')
  return `${y}-${m}-${d}`
}

function addDaysToDateInput(dateInput: string, days: number) {
  const base = dateInput ? new Date(`${dateInput}T00:00:00`) : new Date()
  if (Number.isNaN(base.getTime())) return formatDateInput(new Date())
  base.setDate(base.getDate() + days)
  return formatDateInput(base)
}

function clampProgress(currentAmount: number, targetAmount: number, increment: number) {
  const next = Math.min(Math.max(currentAmount + increment, 0), targetAmount)
  return next
}

export default function GoalsPage() {
  const { user, loading: authLoading } = useAuth()
  const { t } = useLanguage()
  const { formatAmount } = useCurrency()
  const { reduceMotion, allowRichMotion } = useExperience()
  const router = useRouter()

  const [goals, setGoals] = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null)
  const [showProgressModal, setShowProgressModal] = useState<Goal | null>(null)

  const [formData, setFormData] = useState(EMPTY_FORM)
  const [progressAmount, setProgressAmount] = useState('')

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<GoalStatusFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<'all' | Goal['category']>('all')
  const [sortMode, setSortMode] = useState<GoalSortMode>('deadlineSoon')

  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedGoalIds, setSelectedGoalIds] = useState<string[]>([])
  const [bulkAction, setBulkAction] = useState<BulkGoalAction>('progress')
  const [bulkProgressInput, setBulkProgressInput] = useState('')
  const [bulkCategoryInput, setBulkCategoryInput] = useState<Goal['category']>('savings')
  const [bulkDeadlineShiftInput, setBulkDeadlineShiftInput] = useState('7')
  const [bulkApplying, setBulkApplying] = useState(false)

  const [showTemplateCenter, setShowTemplateCenter] = useState(false)
  const [templates, setTemplates] = useState<GoalTemplate[]>([])
  const [templateQuery, setTemplateQuery] = useState('')
  const [confirmClearTemplates, setConfirmClearTemplates] = useState(false)

  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const goalTitleInputRef = useRef<HTMLInputElement | null>(null)

  const GOAL_CATEGORIES = {
    savings: { label: t('goals.categories.savings'), color: 'bg-green-100 text-green-800', icon: '💰' },
    investment: { label: t('goals.categories.investment'), color: 'bg-blue-100 text-blue-800', icon: '📈' },
    purchase: { label: t('goals.categories.purchase'), color: 'bg-purple-100 text-purple-800', icon: '🛒' },
    debt: { label: t('goals.categories.debt'), color: 'bg-red-100 text-red-800', icon: '💳' },
    emergency: { label: t('goals.categories.emergency'), color: 'bg-yellow-100 text-yellow-800', icon: '🛡️' }
  } satisfies Record<Goal['category'], { label: string; color: string; icon: string }>

  const goalCategoryEntries = useMemo(() => Object.entries(GOAL_CATEGORIES) as Array<[Goal['category'], typeof GOAL_CATEGORIES[Goal['category']]]>, [GOAL_CATEGORIES])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/')
    }
  }, [authLoading, user, router])

  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(GOAL_TEMPLATES_STORAGE_KEY)
      if (!raw) return
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setTemplates(parsed.filter((item) => item && typeof item.id === 'string'))
      }
    } catch (error) {
      console.warn('Failed to parse goal templates', error)
    }
  }, [])

  const persistTemplates = useCallback((next: GoalTemplate[]) => {
    setTemplates(next)
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(GOAL_TEMPLATES_STORAGE_KEY, JSON.stringify(next))
    } catch (error) {
      console.warn('Failed to persist goal templates', error)
    }
  }, [])

  useEffect(() => {
    if (user) {
      loadGoals()
    } else if (!authLoading) {
      setLoading(false)
    }
  }, [user, authLoading])

  useEffect(() => {
    if (!showModal) return
    const timer = window.setTimeout(() => {
      goalTitleInputRef.current?.focus()
      goalTitleInputRef.current?.select()
    }, 40)
    return () => window.clearTimeout(timer)
  }, [showModal])

  const loadGoals = async () => {
    if (!user) return
    try {
      setLoading(true)
      const fetchedGoals = await getGoals(user.uid)
      setGoals(fetchedGoals)
    } catch (error) {
      console.error('Error loading goals:', error)
      toast.error(t('goals.loadError'))
    } finally {
      setLoading(false)
    }
  }

  const closeGoalModal = useCallback(() => {
    setShowModal(false)
    setEditingGoal(null)
    setFormData(EMPTY_FORM)
  }, [])

  const openNewGoalModal = useCallback((preset?: Partial<typeof EMPTY_FORM>) => {
    setEditingGoal(null)
    setFormData({ ...EMPTY_FORM, ...preset })
    setShowModal(true)
  }, [])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.title || !formData.targetAmount || !formData.deadline) {
      toast.error(t('goals.fillRequired'))
      return
    }

    try {
      if (editingGoal && editingGoal.id) {
        await updateGoal(editingGoal.id, {
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          deadline: formData.deadline,
          category: formData.category
        })
        toast.success(t('goals.goalUpdated'))
      } else {
        await addGoal({
          userId: user.uid,
          title: formData.title,
          description: formData.description,
          targetAmount: parseFloat(formData.targetAmount),
          currentAmount: 0,
          deadline: formData.deadline,
          category: formData.category,
          isCompleted: false
        })
        toast.success(t('goals.goalAdded'))
      }

      closeGoalModal()
      loadGoals()
    } catch (error) {
      console.error('Error saving goal:', error)
      toast.error(t('common.error'))
    }
  }

  const handleEdit = (goal: Goal) => {
    setEditingGoal(goal)
    setFormData({
      title: goal.title,
      description: goal.description,
      targetAmount: goal.targetAmount.toString(),
      deadline: goal.deadline,
      category: goal.category
    })
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(`${t('common.confirm')}?`)) return
    try {
      await deleteGoal(id)
      toast.success(t('goals.goalDeleted'))
      setSelectedGoalIds((prev) => prev.filter((goalId) => goalId !== id))
      loadGoals()
    } catch (error) {
      console.error('Error deleting goal:', error)
      toast.error(t('common.error'))
    }
  }

  const handleUpdateProgress = async (goal: Goal) => {
    if (!goal.id) return
    const amount = parseFloat(progressAmount)
    if (Number.isNaN(amount) || amount < 0) {
      toast.error(t('goals.validAmount'))
      return
    }

    const newCurrentAmount = Math.min(goal.currentAmount + amount, goal.targetAmount)
    const isCompleted = newCurrentAmount >= goal.targetAmount

    try {
      await updateGoal(goal.id, {
        currentAmount: newCurrentAmount,
        isCompleted
      })

      setShowProgressModal(null)
      setProgressAmount('')
      loadGoals()

      toast.success(isCompleted ? t('goals.congratulations') : t('goals.progressUpdated'))
    } catch (error) {
      console.error('Error updating progress:', error)
      toast.error(t('common.error'))
    }
  }

  const createTemplateFromForm = useCallback(() => {
    if (!formData.title.trim() || !formData.targetAmount.trim()) {
      toast.error('Add at least a goal name and target amount before saving a template.')
      return
    }

    const today = new Date()
    const templateDate = formData.deadline ? new Date(`${formData.deadline}T00:00:00`) : new Date(today)
    const timelineDays = Math.max(1, Math.round((templateDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)))

    const nextTemplate: GoalTemplate = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: `${formData.title.trim()} • ${GOAL_CATEGORIES[formData.category].label}`,
      title: formData.title.trim(),
      description: formData.description.trim(),
      targetAmount: formData.targetAmount.trim(),
      category: formData.category,
      timelineDays,
      createdAt: Date.now(),
    }

    persistTemplates([nextTemplate, ...templates].slice(0, 20))
    toast.success('Goal template saved')
  }, [GOAL_CATEGORIES, formData, persistTemplates, templates])

  const applyTemplateToForm = useCallback((template: GoalTemplate) => {
    setFormData({
      title: template.title,
      description: template.description,
      targetAmount: template.targetAmount,
      category: template.category,
      deadline: addDaysToDateInput(formatDateInput(new Date()), template.timelineDays),
    })
    setShowModal(true)
    toast.success('Template applied')
  }, [])

  const removeTemplate = useCallback((id: string) => {
    persistTemplates(templates.filter((template) => template.id !== id))
  }, [persistTemplates, templates])

  const clearTemplates = useCallback(() => {
    persistTemplates([])
    setConfirmClearTemplates(false)
    toast.success('Templates cleared')
  }, [persistTemplates])

  const getProgressPercentage = useCallback((current: number, target: number) => {
    if (!target || target <= 0) return 0
    return Math.min((current / target) * 100, 100)
  }, [])

  const getDaysUntilDeadline = useCallback((deadline: string) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(`${deadline}T00:00:00`)
    if (Number.isNaN(targetDate.getTime())) return 0
    const diffTime = targetDate.getTime() - today.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }, [])

  const filteredGoals = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase()

    const next = goals.filter((goal) => {
      if (statusFilter === 'active' && goal.isCompleted) return false
      if (statusFilter === 'completed' && !goal.isCompleted) return false
      if (categoryFilter !== 'all' && goal.category !== categoryFilter) return false

      if (!normalizedQuery) return true

      const haystack = [
        goal.title,
        goal.description,
        GOAL_CATEGORIES[goal.category].label,
      ].join(' ').toLowerCase()

      return haystack.includes(normalizedQuery)
    })

    next.sort((a, b) => {
      if (sortMode === 'deadlineSoon') {
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
      }
      if (sortMode === 'progressLow') {
        return getProgressPercentage(a.currentAmount, a.targetAmount) - getProgressPercentage(b.currentAmount, b.targetAmount)
      }
      if (sortMode === 'targetHigh') {
        return b.targetAmount - a.targetAmount
      }
      return (b.createdAt?.getTime?.() || 0) - (a.createdAt?.getTime?.() || 0)
    })

    return next
  }, [GOAL_CATEGORIES, categoryFilter, getProgressPercentage, goals, searchQuery, sortMode, statusFilter])

  const activeGoals = useMemo(() => filteredGoals.filter((goal) => !goal.isCompleted), [filteredGoals])
  const completedGoals = useMemo(() => filteredGoals.filter((goal) => goal.isCompleted), [filteredGoals])

  const allActiveVisibleIds = useMemo(() => activeGoals.map((goal) => goal.id).filter(Boolean) as string[], [activeGoals])

  useEffect(() => {
    setSelectedGoalIds((prev) => prev.filter((id) => allActiveVisibleIds.includes(id)))
  }, [allActiveVisibleIds])

  const selectedGoals = useMemo(() => {
    if (selectedGoalIds.length === 0) return [] as Goal[]
    const selectedSet = new Set(selectedGoalIds)
    return goals.filter((goal) => goal.id && selectedSet.has(goal.id))
  }, [goals, selectedGoalIds])

  const selectedCount = selectedGoalIds.length

  const summaryMetrics = useMemo(() => {
    const inProgress = filteredGoals.filter((g) => !g.isCompleted)
    const complete = filteredGoals.filter((g) => g.isCompleted)
    const remainingAmount = inProgress.reduce((sum, g) => sum + Math.max(g.targetAmount - g.currentAmount, 0), 0)
    const avgProgress = inProgress.length
      ? Math.round(inProgress.reduce((sum, g) => sum + getProgressPercentage(g.currentAmount, g.targetAmount), 0) / inProgress.length)
      : 0

    return {
      total: filteredGoals.length,
      inProgress: inProgress.length,
      complete: complete.length,
      remainingAmount,
      avgProgress,
      rawTotal: goals.length,
    }
  }, [filteredGoals, goals.length, getProgressPercentage])

  const goalsCopilot = useMemo(() => {
    const overdue = activeGoals.filter((goal) => getDaysUntilDeadline(goal.deadline) < 0)
    const dueSoon = activeGoals.filter((goal) => {
      const days = getDaysUntilDeadline(goal.deadline)
      return days >= 0 && days <= 14
    })
    const lowProgress = activeGoals.filter((goal) => getProgressPercentage(goal.currentAmount, goal.targetAmount) < 25)

    if (goals.length === 0) {
      return {
        title: 'Start with one simple goal',
        body: 'Create a savings goal with a realistic target and a 30-90 day deadline so you can build momentum quickly.',
        actionLabel: 'Create starter goal',
        action: () => openNewGoalModal({ category: 'savings', deadline: addDaysToDateInput(formatDateInput(new Date()), 30) }),
      }
    }

    if (overdue.length > 0) {
      return {
        title: `${overdue.length} goal${overdue.length > 1 ? 's are' : ' is'} overdue`,
        body: 'Extend deadlines or add progress today to avoid stale goals. Focus on the closest overdue target first.',
        actionLabel: 'Filter active goals',
        action: () => {
          setStatusFilter('active')
          setSortMode('deadlineSoon')
        },
      }
    }

    if (dueSoon.length > 0 && lowProgress.length > 0) {
      return {
        title: 'You have goals due soon with low progress',
        body: 'Use bulk progress updates for recent contributions, then review deadlines to keep your plan realistic.',
        actionLabel: 'Use bulk progress',
        action: () => {
          setStatusFilter('active')
          setSelectionMode(true)
          setBulkAction('progress')
        },
      }
    }

    if (templates.length === 0) {
      return {
        title: 'Save a reusable goal template',
        body: 'Templates make recurring savings or debt payoff plans faster to create and more consistent.',
        actionLabel: 'Open template center',
        action: () => setShowTemplateCenter(true),
      }
    }

    return {
      title: 'Goals system is healthy',
      body: 'Keep updating progress weekly and use templates + bulk edits to maintain consistency as goals grow.',
      actionLabel: 'Review active goals',
      action: () => {
        setStatusFilter('active')
        setSearchQuery('')
      },
    }
  }, [activeGoals, getDaysUntilDeadline, getProgressPercentage, goals.length, openNewGoalModal, templates.length])

  const templateList = useMemo(() => {
    const q = templateQuery.trim().toLowerCase()
    if (!q) return templates
    return templates.filter((template) => `${template.name} ${template.description}`.toLowerCase().includes(q))
  }, [templateQuery, templates])

  const bulkImpactPreview = useMemo(() => {
    if (selectedGoals.length === 0) return null

    if (bulkAction === 'progress') {
      const increment = parseFloat(bulkProgressInput)
      if (Number.isNaN(increment) || increment < 0) return null

      let beforeCurrent = 0
      let afterCurrent = 0
      let targetTotal = 0
      let completedBefore = 0
      let completedAfter = 0

      for (const goal of selectedGoals) {
        beforeCurrent += goal.currentAmount
        targetTotal += goal.targetAmount
        if (goal.isCompleted) completedBefore += 1
        const nextCurrent = clampProgress(goal.currentAmount, goal.targetAmount, increment)
        afterCurrent += nextCurrent
        if (nextCurrent >= goal.targetAmount) completedAfter += 1
      }

      return {
        mode: 'progress' as const,
        selectedCount: selectedGoals.length,
        beforeCurrent,
        afterCurrent,
        deltaCurrent: afterCurrent - beforeCurrent,
        targetTotal,
        completedDelta: completedAfter - completedBefore,
      }
    }

    if (bulkAction === 'category') {
      const currentCategoryMatches = selectedGoals.filter((goal) => goal.category === bulkCategoryInput).length
      return {
        mode: 'category' as const,
        selectedCount: selectedGoals.length,
        changes: selectedGoals.length - currentCategoryMatches,
        targetCategory: bulkCategoryInput,
      }
    }

    const shiftDays = parseInt(bulkDeadlineShiftInput, 10)
    if (Number.isNaN(shiftDays) || shiftDays === 0) return null
    const overdueCount = selectedGoals.filter((goal) => getDaysUntilDeadline(goal.deadline) < 0).length

    return {
      mode: 'deadline' as const,
      selectedCount: selectedGoals.length,
      shiftDays,
      overdueCount,
    }
  }, [bulkAction, bulkCategoryInput, bulkDeadlineShiftInput, bulkProgressInput, getDaysUntilDeadline, selectedGoals])

  const toggleGoalSelected = useCallback((goalId?: string) => {
    if (!goalId) return
    setSelectedGoalIds((prev) => prev.includes(goalId) ? prev.filter((id) => id !== goalId) : [...prev, goalId])
  }, [])

  const toggleSelectAllVisible = useCallback(() => {
    if (allActiveVisibleIds.length === 0) return
    setSelectedGoalIds((prev) => {
      const prevSet = new Set(prev)
      const allSelected = allActiveVisibleIds.every((id) => prevSet.has(id))
      if (allSelected) {
        return prev.filter((id) => !allActiveVisibleIds.includes(id))
      }
      const next = new Set(prev)
      allActiveVisibleIds.forEach((id) => next.add(id))
      return Array.from(next)
    })
  }, [allActiveVisibleIds])

  const resetSelectionMode = useCallback(() => {
    setSelectionMode(false)
    setSelectedGoalIds([])
  }, [])

  const applyBulkAction = useCallback(async () => {
    if (selectedGoals.length === 0) {
      toast.error('Select at least one goal first.')
      return
    }

    const selectedWithIds = selectedGoals.filter((goal): goal is Goal & { id: string } => Boolean(goal.id))
    if (selectedWithIds.length === 0) return

    try {
      setBulkApplying(true)

      if (bulkAction === 'progress') {
        const increment = parseFloat(bulkProgressInput)
        if (Number.isNaN(increment) || increment < 0) {
          toast.error('Enter a valid progress amount.')
          return
        }
        await Promise.all(selectedWithIds.map((goal) => {
          const nextCurrent = clampProgress(goal.currentAmount, goal.targetAmount, increment)
          return updateGoal(goal.id, {
            currentAmount: nextCurrent,
            isCompleted: nextCurrent >= goal.targetAmount,
          })
        }))
        toast.success(`Updated progress for ${selectedWithIds.length} goal${selectedWithIds.length > 1 ? 's' : ''}`)
      }

      if (bulkAction === 'category') {
        await Promise.all(selectedWithIds.map((goal) => updateGoal(goal.id, { category: bulkCategoryInput })))
        toast.success(`Updated category for ${selectedWithIds.length} goal${selectedWithIds.length > 1 ? 's' : ''}`)
      }

      if (bulkAction === 'deadline') {
        const shiftDays = parseInt(bulkDeadlineShiftInput, 10)
        if (Number.isNaN(shiftDays) || shiftDays === 0) {
          toast.error('Enter a deadline shift in days (e.g. 7 or -7).')
          return
        }
        await Promise.all(selectedWithIds.map((goal) => updateGoal(goal.id, {
          deadline: addDaysToDateInput(goal.deadline, shiftDays)
        })))
        toast.success(`Shifted deadlines for ${selectedWithIds.length} goal${selectedWithIds.length > 1 ? 's' : ''}`)
      }

      await loadGoals()
    } catch (error) {
      console.error('Error applying bulk goal action:', error)
      toast.error(t('common.error'))
    } finally {
      setBulkApplying(false)
    }
  }, [bulkAction, bulkCategoryInput, bulkDeadlineShiftInput, bulkProgressInput, selectedGoals, t])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const tagName = target?.tagName?.toLowerCase()
      const isTypingField = Boolean(
        target?.isContentEditable ||
        tagName === 'input' ||
        tagName === 'textarea' ||
        tagName === 'select'
      )

      const key = event.key.toLowerCase()
      const meta = event.metaKey || event.ctrlKey

      if (meta && key === 'a' && selectionMode) {
        event.preventDefault()
        toggleSelectAllVisible()
        return
      }

      if (!isTypingField && key === '/') {
        event.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
        return
      }

      if (key === 'escape') {
        if (showProgressModal) {
          setShowProgressModal(null)
          setProgressAmount('')
          return
        }
        if (showModal) {
          closeGoalModal()
          return
        }
        if (showTemplateCenter) {
          setShowTemplateCenter(false)
          return
        }
        if (selectionMode) {
          resetSelectionMode()
          return
        }
      }

      if (isTypingField) return

      if (key === 'n') {
        event.preventDefault()
        openNewGoalModal({ deadline: addDaysToDateInput(formatDateInput(new Date()), 30) })
        return
      }

      if (key === 's') {
        event.preventDefault()
        setSelectionMode((prev) => !prev)
        if (selectionMode) setSelectedGoalIds([])
        return
      }

      if (key === 'r') {
        event.preventDefault()
        setShowTemplateCenter((prev) => !prev)
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [closeGoalModal, openNewGoalModal, resetSelectionMode, selectionMode, showModal, showProgressModal, showTemplateCenter, toggleSelectAllVisible])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6">
        <div className="max-w-7xl mx-auto space-y-4 animate-pulse">
          <div className="h-8 w-52 bg-gray-200 rounded-lg" />
          <div className="h-4 w-80 max-w-full bg-gray-200 rounded" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-28 bg-white rounded-xl border border-gray-100" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-xl border border-gray-100" />
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 pb-28">
        <motion.div
          className="mb-6"
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{t('goals.title')}</h1>
              <p className="text-gray-600">{t('goals.description')}</p>
              <p className="mt-2 text-xs text-gray-500">Shortcuts: `/` search, `N` new goal, `S` selection mode, `R` template center</p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowTemplateCenter((prev) => !prev)}
                className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${showTemplateCenter ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
              >
                <Squares2X2Icon className="h-4 w-4" />
                Template Center
              </button>
              <motion.button
                onClick={() => openNewGoalModal({ deadline: addDaysToDateInput(formatDateInput(new Date()), 30) })}
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                whileHover={allowRichMotion ? { y: -1 } : undefined}
                whileTap={allowRichMotion ? { scale: 0.98 } : undefined}
              >
                <PlusIcon className="w-5 h-5 mr-2" />
                {t('goals.addGoal')}
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.05, duration: 0.3 }}
        >
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1.5fr)_repeat(3,minmax(0,1fr))]">
            <div className="relative">
              <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search goals, categories, descriptions..."
                className="w-full rounded-xl border border-gray-200 pl-10 pr-10 py-2.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <XMarkIcon className="h-4 w-4" />
                </button>
              )}
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as GoalStatusFilter)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All goals</option>
              <option value="active">Active only</option>
              <option value="completed">Completed only</option>
            </select>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value as 'all' | Goal['category'])}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="all">All categories</option>
              {goalCategoryEntries.map(([key, category]) => (
                <option key={key} value={key}>{category.icon} {category.label}</option>
              ))}
            </select>

            <select
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as GoalSortMode)}
              className="rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-900 focus:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-100"
            >
              <option value="deadlineSoon">Deadline: Soonest first</option>
              <option value="progressLow">Progress: Lowest first</option>
              <option value="targetHigh">Target: Highest first</option>
              <option value="recent">Recently created</option>
            </select>
          </div>
        </motion.div>

        <motion.div
          className="mb-6 rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 p-5 text-white shadow-lg"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.3 }}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-cyan-200">
                <SparklesIcon className="h-4 w-4" />
                Goals Copilot
              </div>
              <h2 className="text-lg font-semibold">{goalsCopilot.title}</h2>
              <p className="mt-1 text-sm text-slate-200">{goalsCopilot.body}</p>
            </div>
            <button
              type="button"
              onClick={goalsCopilot.action}
              className="inline-flex items-center justify-center rounded-xl bg-white px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-slate-100 transition-colors"
            >
              {goalsCopilot.actionLabel}
            </button>
          </div>
        </motion.div>

        <AnimatePresence initial={false}>
          {showTemplateCenter && (
            <motion.div
              key="template-center"
              className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              initial={reduceMotion ? false : { opacity: 0, y: -6 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Goal Template Center</h2>
                  <p className="text-xs text-slate-500">Save recurring goal setups and apply them in one click.</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={templateQuery}
                    onChange={(e) => setTemplateQuery(e.target.value)}
                    placeholder="Search templates"
                    className="w-full sm:w-52 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900"
                  />
                  {templates.length > 0 && (
                    confirmClearTemplates ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={clearTemplates}
                          className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                        >
                          Confirm Clear
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmClearTemplates(false)}
                          className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setConfirmClearTemplates(true)}
                        className="rounded-lg border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                      >
                        Clear All
                      </button>
                    )
                  )}
                </div>
              </div>

              {templateList.length === 0 ? (
                <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                  {templates.length === 0 ? 'No goal templates yet. Save one from the goal form.' : 'No templates match your search.'}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
                  {templateList.map((template) => (
                    <motion.div
                      key={template.id}
                      layout
                      className="rounded-xl border border-gray-200 bg-white p-4"
                      whileHover={allowRichMotion ? { y: -2 } : undefined}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{template.name}</p>
                          <p className="mt-1 text-xs text-slate-500 line-clamp-2">{template.description || 'No description'}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeTemplate(template.id)}
                          className="rounded-md p-1 text-gray-400 hover:bg-gray-100 hover:text-red-600"
                          aria-label="Remove template"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                      <div className="mt-3 space-y-1 text-xs text-slate-600">
                        <p className="flex items-center gap-1"><TagIcon className="h-3.5 w-3.5" /> {GOAL_CATEGORIES[template.category].label}</p>
                        <p className="flex items-center gap-1"><CalendarDaysIcon className="h-3.5 w-3.5" /> {template.timelineDays} day timeline</p>
                        <p className="font-medium text-slate-900">Target {formatAmount(Number(template.targetAmount) || 0)}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => applyTemplateToForm(template)}
                        className="mt-3 w-full rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white hover:bg-slate-800"
                      >
                        Apply Template
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.35 }}
        >
          {[
            { label: t('goals.totalGoals'), value: summaryMetrics.total, accent: 'text-blue-600', sub: summaryMetrics.rawTotal !== summaryMetrics.total ? `of ${summaryMetrics.rawTotal} total` : 'Current filtered set' },
            { label: t('goals.inProgress'), value: summaryMetrics.inProgress, accent: 'text-orange-600', sub: 'Still in progress' },
            { label: t('goals.completed'), value: summaryMetrics.complete, accent: 'text-green-600', sub: 'Reached target' },
            { label: t('goals.completionRate'), value: `${summaryMetrics.total > 0 ? Math.round((summaryMetrics.complete / summaryMetrics.total) * 100) : 0}%`, accent: 'text-purple-600', sub: 'Completion rate' },
            { label: 'Remaining to fund', value: formatAmount(summaryMetrics.remainingAmount), accent: 'text-slate-900', sub: `Avg active progress ${summaryMetrics.avgProgress}%` },
          ].map((card, index) => (
            <motion.div
              key={card.label}
              className="bg-white p-5 rounded-xl shadow-sm border border-gray-100"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.14 + index * 0.03, duration: 0.25 }}
              whileHover={allowRichMotion ? { y: -2 } : undefined}
            >
              <h3 className="text-sm font-medium text-gray-500 mb-2">{card.label}</h3>
              <p className={`text-2xl font-bold ${card.accent}`}>{card.value}</p>
              <p className="mt-2 text-xs text-gray-500">{card.sub}</p>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          className="mb-6 flex flex-wrap items-center gap-2"
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={reduceMotion ? undefined : { opacity: 1 }}
          transition={{ delay: 0.16, duration: 0.25 }}
        >
          <button
            type="button"
            onClick={() => setSelectionMode((prev) => {
              if (prev) setSelectedGoalIds([])
              return !prev
            })}
            className={`min-h-[40px] rounded-lg border px-3 text-sm font-medium transition-colors ${selectionMode ? 'border-indigo-300 bg-indigo-50 text-indigo-700' : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'}`}
          >
            {selectionMode ? `Done (${selectedCount})` : 'Select goals'}
          </button>
          {selectionMode && (
            <>
              <button
                type="button"
                onClick={toggleSelectAllVisible}
                className="min-h-[40px] rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                {allActiveVisibleIds.length > 0 && allActiveVisibleIds.every((id) => selectedGoalIds.includes(id)) ? 'Unselect visible' : 'Select visible'}
              </button>
              <span className="text-sm text-gray-500">Bulk actions only apply to visible active goals.</span>
            </>
          )}
        </motion.div>

        <AnimatePresence initial={false}>
          {selectionMode && selectedCount > 0 && (
            <motion.div
              key="bulk-goals"
              className="mb-8 rounded-2xl border border-indigo-100 bg-white p-4 shadow-sm"
              initial={reduceMotion ? false : { opacity: 0, y: 8 }}
              animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              exit={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              transition={{ duration: 0.2 }}
            >
              <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">Bulk Goal Actions</h2>
                  <p className="text-xs text-slate-500">Apply updates to {selectedCount} selected goal{selectedCount > 1 ? 's' : ''}.</p>
                </div>
                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
                  {selectedCount} selected
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,180px)_minmax(0,1fr)_auto]">
                <select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value as BulkGoalAction)}
                  className="rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                >
                  <option value="progress">Add progress amount</option>
                  <option value="category">Set category</option>
                  <option value="deadline">Shift deadlines</option>
                </select>

                <div className="flex flex-col gap-3 sm:flex-row">
                  {bulkAction === 'progress' && (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={bulkProgressInput}
                      onChange={(e) => setBulkProgressInput(e.target.value)}
                      placeholder="Amount to add to each selected goal"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                  )}
                  {bulkAction === 'category' && (
                    <select
                      value={bulkCategoryInput}
                      onChange={(e) => setBulkCategoryInput(e.target.value as Goal['category'])}
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    >
                      {goalCategoryEntries.map(([key, category]) => (
                        <option key={key} value={key}>{category.icon} {category.label}</option>
                      ))}
                    </select>
                  )}
                  {bulkAction === 'deadline' && (
                    <input
                      type="number"
                      step="1"
                      value={bulkDeadlineShiftInput}
                      onChange={(e) => setBulkDeadlineShiftInput(e.target.value)}
                      placeholder="Days to shift (e.g. 7 or -7)"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm text-gray-900"
                    />
                  )}
                </div>

                <button
                  type="button"
                  onClick={applyBulkAction}
                  disabled={bulkApplying}
                  className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bulkApplying ? 'Applying...' : 'Apply'}
                </button>
              </div>

              {bulkImpactPreview && (
                <div className="mt-4 rounded-xl border border-indigo-100 bg-indigo-50/50 p-4">
                  <div className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-indigo-700">Change Preview</div>
                  {bulkImpactPreview.mode === 'progress' && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
                      <div><p className="text-xs text-gray-500">Selected</p><p className="text-sm font-semibold text-slate-900">{bulkImpactPreview.selectedCount}</p></div>
                      <div><p className="text-xs text-gray-500">Current total</p><p className="text-sm font-semibold text-slate-900">{formatAmount(bulkImpactPreview.beforeCurrent)}</p></div>
                      <div><p className="text-xs text-gray-500">Projected total</p><p className="text-sm font-semibold text-slate-900">{formatAmount(bulkImpactPreview.afterCurrent)}</p></div>
                      <div><p className="text-xs text-gray-500">Progress delta</p><p className="text-sm font-semibold text-emerald-700">+{formatAmount(bulkImpactPreview.deltaCurrent)}</p></div>
                      <div><p className="text-xs text-gray-500">New completions</p><p className="text-sm font-semibold text-indigo-700">+{bulkImpactPreview.completedDelta}</p></div>
                    </div>
                  )}
                  {bulkImpactPreview.mode === 'category' && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div><p className="text-xs text-gray-500">Selected</p><p className="text-sm font-semibold text-slate-900">{bulkImpactPreview.selectedCount}</p></div>
                      <div><p className="text-xs text-gray-500">Will change</p><p className="text-sm font-semibold text-slate-900">{bulkImpactPreview.changes}</p></div>
                      <div className="md:col-span-2"><p className="text-xs text-gray-500">Target category</p><p className="text-sm font-semibold text-slate-900">{GOAL_CATEGORIES[bulkImpactPreview.targetCategory].label}</p></div>
                    </div>
                  )}
                  {bulkImpactPreview.mode === 'deadline' && (
                    <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                      <div><p className="text-xs text-gray-500">Selected</p><p className="text-sm font-semibold text-slate-900">{bulkImpactPreview.selectedCount}</p></div>
                      <div><p className="text-xs text-gray-500">Shift days</p><p className={`text-sm font-semibold ${bulkImpactPreview.shiftDays >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>{bulkImpactPreview.shiftDays >= 0 ? '+' : ''}{bulkImpactPreview.shiftDays}d</p></div>
                      <div className="md:col-span-2"><p className="text-xs text-gray-500">Overdue goals in selection</p><p className="text-sm font-semibold text-slate-900">{bulkImpactPreview.overdueCount}</p></div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="mb-8"
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.35 }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-gray-900">{t('goals.activeGoals')}</h2>
            <span className="text-sm text-gray-500">{activeGoals.length} visible</span>
          </div>

          {activeGoals.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-gray-100">
              <p className="text-gray-700 font-medium">No active goals match your filters.</p>
              <p className="mt-1 text-sm text-gray-500">Try clearing search/filter settings or create a new goal.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('')
                    setStatusFilter('all')
                    setCategoryFilter('all')
                  }}
                  className="rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Clear filters
                </button>
                <button
                  type="button"
                  onClick={() => openNewGoalModal({ deadline: addDaysToDateInput(formatDateInput(new Date()), 30) })}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700"
                >
                  Create goal
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeGoals.map((goal, index) => {
                const percentage = getProgressPercentage(goal.currentAmount, goal.targetAmount)
                const daysLeft = getDaysUntilDeadline(goal.deadline)
                const category = GOAL_CATEGORIES[goal.category]
                const isSelected = Boolean(goal.id && selectedGoalIds.includes(goal.id))

                return (
                  <motion.div
                    key={goal.id}
                    layout
                    className={`bg-white p-6 rounded-xl shadow-sm border transition-colors ${isSelected ? 'border-indigo-300 ring-2 ring-indigo-100' : 'border-gray-100'}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 12 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.18), duration: 0.25 }}
                    whileHover={allowRichMotion ? { y: -2 } : undefined}
                  >
                    <div className="flex justify-between items-start mb-4 gap-3">
                      <div className="flex items-center space-x-3 min-w-0">
                        <span className="text-2xl shrink-0">{category.icon}</span>
                        <div className="min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{goal.title}</h3>
                          <div className="mt-1 flex flex-wrap items-center gap-2">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                              {category.label}
                            </span>
                            {daysLeft < 0 && (
                              <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                {Math.abs(daysLeft)}d overdue
                              </span>
                            )}
                            {daysLeft >= 0 && daysLeft <= 14 && (
                              <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                Due soon
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 shrink-0">
                        {selectionMode && goal.id && (
                          <button
                            type="button"
                            onClick={() => toggleGoalSelected(goal.id)}
                            className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors ${isSelected ? 'bg-indigo-600 text-white' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'}`}
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(goal)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          aria-label="Edit goal"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => goal.id && handleDelete(goal.id)}
                          className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                          aria-label="Delete goal"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">{goal.description}</p>
                    )}

                    <div className="mb-4">
                      <div className="mb-2 flex items-center justify-between text-sm text-gray-600">
                        <span>{formatAmount(goal.currentAmount)}</span>
                        <span>{formatAmount(goal.targetAmount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <motion.div
                          className="h-2 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400"
                          initial={reduceMotion ? false : { width: 0 }}
                          animate={{ width: `${percentage}%` }}
                          transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.04 + 0.2, 0.35), duration: 0.6 }}
                        />
                      </div>
                      <div className="mt-2 flex items-center justify-between text-xs">
                        <span className="text-gray-500">{percentage.toFixed(1)}% {t('goals.completedText')}</span>
                        <span className="font-medium text-gray-700">Remaining {formatAmount(Math.max(goal.targetAmount - goal.currentAmount, 0))}</span>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="text-sm text-gray-500">
                        {daysLeft > 0 ? `${daysLeft} ${t('goals.daysLeft')}` : daysLeft === 0 ? 'Due today' : t('goals.expired')}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {selectionMode && goal.id && (
                          <button
                            type="button"
                            onClick={() => toggleGoalSelected(goal.id)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 text-sm hover:bg-gray-50"
                          >
                            {isSelected ? 'Unselect' : 'Select'}
                          </button>
                        )}
                        <button
                          onClick={() => setShowProgressModal(goal)}
                          className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg text-sm hover:bg-blue-200 transition-colors"
                        >
                          {t('goals.updateProgress')}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          )}
        </motion.div>

        {completedGoals.length > 0 && (
          <motion.div
            initial={reduceMotion ? false : { opacity: 0, y: 12 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={{ delay: 0.24, duration: 0.3 }}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-lg font-medium text-gray-900">{t('goals.completedGoals')}</h2>
              <span className="text-sm text-gray-500">{completedGoals.length} visible</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {completedGoals.map((goal, index) => {
                const category = GOAL_CATEGORIES[goal.category]
                return (
                  <motion.div
                    key={goal.id}
                    layout
                    className="bg-green-50 p-6 rounded-xl shadow-sm border border-green-200"
                    initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={{ delay: reduceMotion ? 0 : Math.min(index * 0.03, 0.15), duration: 0.25 }}
                    whileHover={allowRichMotion ? { y: -1 } : undefined}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex items-center space-x-3 min-w-0">
                        <CheckCircleIcon className="w-8 h-8 text-green-600 shrink-0" />
                        <div className="min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">{goal.title}</h3>
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${category.color}`}>
                            {category.label}
                          </span>
                        </div>
                      </div>
                    </div>
                    <p className="text-green-700 font-medium">{t('goals.congratulations')} {formatAmount(goal.targetAmount)}</p>
                    {goal.description && <p className="mt-2 text-sm text-green-900/70 line-clamp-2">{goal.description}</p>}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {filteredGoals.length === 0 && goals.length > 0 && (
          <motion.div
            className="mt-8 rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center"
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={reduceMotion ? undefined : { opacity: 1 }}
          >
            <h3 className="text-lg font-medium text-gray-900 mb-1">No goals match your filters</h3>
            <p className="text-sm text-gray-500 mb-4">Try adjusting search, status, category, or sort settings.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('')
                setStatusFilter('all')
                setCategoryFilter('all')
                setSortMode('deadlineSoon')
              }}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Reset filters
            </button>
          </motion.div>
        )}

        <AnimatePresence>
          {showModal && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? undefined : { opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
            >
              <div className="flex h-full items-center justify-center">
                <motion.div
                  className="bg-white p-6 rounded-xl max-w-md w-full max-h-[85vh] overflow-y-auto"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {editingGoal ? t('goals.editModal.title') : t('goals.addModal.title')}
                      </h3>
                      <p className="mt-1 text-xs text-gray-500">You can save this setup as a reusable template.</p>
                    </div>
                    <button
                      type="button"
                      onClick={closeGoalModal}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                      aria-label="Close"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('goals.name')}
                      </label>
                      <input
                        ref={goalTitleInputRef}
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                        placeholder={t('goals.namePlaceholder')}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('goals.descriptionLabel')}
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                        rows={3}
                        placeholder={t('goals.descriptionPlaceholder')}
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('goals.targetAmount')}
                        </label>
                        <input
                          type="number"
                          value={formData.targetAmount}
                          onChange={(e) => setFormData(prev => ({ ...prev, targetAmount: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          required
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          {t('goals.deadline')}
                        </label>
                        <input
                          type="date"
                          value={formData.deadline}
                          onChange={(e) => setFormData(prev => ({ ...prev, deadline: e.target.value }))}
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {t('goals.category')}
                      </label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Goal['category'] }))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900"
                      >
                        {goalCategoryEntries.map(([key, category]) => (
                          <option key={key} value={key}>
                            {category.icon} {category.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">Template Tools</p>
                        <button
                          type="button"
                          onClick={createTemplateFromForm}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          Save Template
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">Save this goal setup for faster reuse across savings, debt, or investment plans.</p>
                    </div>

                    <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2">
                      <button
                        type="button"
                        onClick={closeGoalModal}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                      >
                        {t('common.cancel')}
                      </button>
                      <button
                        type="submit"
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                      >
                        {editingGoal ? t('goals.update') : t('goals.add')}
                      </button>
                    </div>
                  </form>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showProgressModal && (
            <motion.div
              className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6"
              initial={reduceMotion ? false : { opacity: 0 }}
              animate={reduceMotion ? undefined : { opacity: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
            >
              <div className="flex h-full items-center justify-center">
                <motion.div
                  className="bg-white p-6 rounded-xl max-w-md w-full mx-4"
                  initial={reduceMotion ? false : { opacity: 0, scale: 0.98, y: 8 }}
                  animate={reduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
                  exit={reduceMotion ? undefined : { opacity: 0, scale: 0.98, y: 8 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {t('goals.updateProgress')} - {showProgressModal.title}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setShowProgressModal(null)
                        setProgressAmount('')
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>

                  <div className="mb-4">
                    <p className="text-sm text-gray-600 mb-2">
                      {t('goals.currentProgress')}: {formatAmount(showProgressModal.currentAmount)} / {formatAmount(showProgressModal.targetAmount)}
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-2 rounded-full bg-blue-500"
                        initial={reduceMotion ? false : { width: 0 }}
                        animate={{ width: `${getProgressPercentage(showProgressModal.currentAmount, showProgressModal.targetAmount)}%` }}
                        transition={{ duration: 0.45 }}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('goals.addAmount')}
                    </label>
                    <input
                      type="number"
                      value={progressAmount}
                      onChange={(e) => setProgressAmount(e.target.value)}
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-gray-900 placeholder-gray-500"
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-3">
                    <button
                      onClick={() => {
                        setShowProgressModal(null)
                        setProgressAmount('')
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      onClick={() => handleUpdateProgress(showProgressModal)}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {t('goals.update')}
                    </button>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
