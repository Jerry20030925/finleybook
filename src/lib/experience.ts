export const REDUCE_MOTION_STORAGE_KEY = 'finley_reduce_motion'

const isBrowser = () => typeof window !== 'undefined'

export const getStoredReduceMotionPreference = (): boolean | null => {
  if (!isBrowser()) return null

  const raw = window.localStorage.getItem(REDUCE_MOTION_STORAGE_KEY)
  if (raw === '1') return true
  if (raw === '0') return false
  return null
}

export const setStoredReduceMotionPreference = (value: boolean) => {
  if (!isBrowser()) return
  window.localStorage.setItem(REDUCE_MOTION_STORAGE_KEY, value ? '1' : '0')
}
