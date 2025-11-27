'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { initializeFirebase } from '@/lib/firebase'
import PageLoader from './PageLoader'
import { useSearchParams } from 'next/navigation'

interface AuthContextType {
  user: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [auth, setAuth] = useState<any>(null)

  useEffect(() => {
    // Check for referral code in URL
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const refCode = params.get('ref')
      if (refCode) {
        localStorage.setItem('referralCode', refCode)
      }
    }

    let mounted = true
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out')
        setLoading(false)
      }
    }, 10000)

    // Initialize Firebase dynamically
    const initAuth = async () => {
      try {
        const firebase = await initializeFirebase()
        if (!firebase.auth) {
          throw new Error('Firebase auth not available')
        }

        if (mounted) {
          setAuth(firebase.auth)

          const { onAuthStateChanged } = await import('firebase/auth')
          const unsubscribe = onAuthStateChanged(firebase.auth, (user) => {
            if (mounted) {
              clearTimeout(timeoutId)
              setUser(user)
              setLoading(false)
              setError(null)
            }
          }, (error) => {
            if (mounted) {
              clearTimeout(timeoutId)
              console.error('Auth state change error:', error)
              setError(error.message)
              setLoading(false)
            }
          })

          return () => {
            mounted = false
            clearTimeout(timeoutId)
            unsubscribe()
          }
        }
      } catch (error: any) {
        clearTimeout(timeoutId)
        console.error('Auth initialization error:', error)
        if (mounted) {
          setError('Authentication initialization failed: ' + error.message)
          setLoading(false)
        }
      }
    }

    initAuth()

    return () => {
      mounted = false
      clearTimeout(timeoutId)
    }
  }, [])

  const trackReferral = async (userId: string) => {
    const referralCode = localStorage.getItem('referralCode')
    if (referralCode) {
      try {
        await fetch('/api/referral/track', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, referralCode }),
        })
        localStorage.removeItem('referralCode') // Clear after use
      } catch (err) {
        console.error('Failed to track referral:', err)
      }
    }
  }

  const signIn = async (email: string, password: string) => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized (Check console for details)'
      console.error('SignIn blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      const { signInWithEmailAndPassword } = await import('firebase/auth')
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized (Check console for details)'
      console.error('SignUp blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      const { createUserWithEmailAndPassword } = await import('firebase/auth')
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      await trackReferral(userCredential.user.uid)
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized (Check console for details)'
      console.error('GoogleSignIn blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      const { GoogleAuthProvider, signInWithPopup } = await import('firebase/auth')
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      const isNewUser = (result as any)._tokenResponse?.isNewUser ||
        result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        await trackReferral(result.user.uid)
      }
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const logout = async () => {
    if (!auth) {
      // If auth is null but we want to logout, just clear local state
      setUser(null)
      return
    }
    try {
      setError(null)
      const { signOut } = await import('firebase/auth')
      await signOut(auth)
    } catch (error: any) {
      console.error('Logout error:', error)
      setError(error.message)
      throw error
    }
  }



  return (
    <AuthContext.Provider value={{ user, loading, error, signIn, signUp, signInWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}