import { useEffect, useState } from 'react'

export type WorkflowPreferences = {
  automationPreset: 'safe' | 'balanced' | 'power'
  digestDeliveryMode: 'priority' | 'batched' | 'realtime'
  defaultReportExport: 'pdf' | 'csv' | 'both'
  reportFocusMode: 'balanced' | 'cashflow' | 'savings' | 'anomalies'
  quietHoursEnabled: boolean
  quietHoursStart: string
  quietHoursEnd: string
  workdayOnlyNotifications: boolean
  notificationBypassTypes: Array<'success' | 'info' | 'warning' | 'error' | 'promo' | 'ai-alert'>
  autoOpenWalletCoach: boolean
  stickyMobileActionBar: boolean
  showShortcutHints: boolean
  aiActionApproval: 'suggest_only' | 'confirm_write' | 'auto_safe'
}

export const defaultWorkflowPreferences: WorkflowPreferences = {
  automationPreset: 'balanced',
  digestDeliveryMode: 'priority',
  defaultReportExport: 'pdf',
  reportFocusMode: 'balanced',
  quietHoursEnabled: true,
  quietHoursStart: '22:00',
  quietHoursEnd: '07:00',
  workdayOnlyNotifications: false,
  notificationBypassTypes: ['warning', 'error', 'ai-alert'],
  autoOpenWalletCoach: true,
  stickyMobileActionBar: true,
  showShortcutHints: true,
  aiActionApproval: 'confirm_write',
}

const WORKFLOW_PREF_EVENT = 'finley:workflow-preferences-updated'

function mergeWorkflowPreferences(value: unknown): WorkflowPreferences {
  if (!value || typeof value !== 'object') return defaultWorkflowPreferences
  return {
    ...defaultWorkflowPreferences,
    ...(value as Partial<WorkflowPreferences>),
  }
}

function loadFromLocalStorage(userId?: string | null): WorkflowPreferences {
  if (!userId || typeof window === 'undefined') return defaultWorkflowPreferences
  try {
    const raw = window.localStorage.getItem(`finley_workflow_preferences_${userId}`)
    if (!raw) return defaultWorkflowPreferences
    return mergeWorkflowPreferences(JSON.parse(raw))
  } catch {
    return defaultWorkflowPreferences
  }
}

export function useWorkflowPreferences(userId?: string | null) {
  const [workflowPreferences, setWorkflowPreferences] = useState<WorkflowPreferences>(defaultWorkflowPreferences)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setWorkflowPreferences(loadFromLocalStorage(userId))

    const handleUpdated = (event: Event) => {
      const customEvent = event as CustomEvent<Partial<WorkflowPreferences> | undefined>
      if (customEvent.detail && typeof customEvent.detail === 'object') {
        setWorkflowPreferences((prev) => ({
          ...prev,
          ...mergeWorkflowPreferences(customEvent.detail),
        }))
        return
      }
      setWorkflowPreferences(loadFromLocalStorage(userId))
    }

    const handleStorage = (event: StorageEvent) => {
      if (!userId) return
      if (event.key && event.key !== `finley_workflow_preferences_${userId}`) return
      setWorkflowPreferences(loadFromLocalStorage(userId))
    }

    window.addEventListener(WORKFLOW_PREF_EVENT, handleUpdated as EventListener)
    window.addEventListener('storage', handleStorage)
    return () => {
      window.removeEventListener(WORKFLOW_PREF_EVENT, handleUpdated as EventListener)
      window.removeEventListener('storage', handleStorage)
    }
  }, [userId])

  return workflowPreferences
}
