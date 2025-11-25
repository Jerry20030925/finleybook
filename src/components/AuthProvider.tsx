'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import PageLoader from './PageLoader'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true
    const timeoutId = setTimeout(() => {
      if (mounted) {
        console.warn('Auth initialization timed out')
        setLoading(false)
      }
    }, 2000)

    try {
      const unsubscribe = onAuthStateChanged(auth, (user) => {
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
    } catch (error: any) {
      clearTimeout(timeoutId)
      console.error('Auth initialization error:', error)
      if (mounted) {
        setError('Authentication initialization failed')
        setLoading(false)
      }
    }
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      setError(null)
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error('Sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signUp = async (email: string, password: string) => {
    try {
      setError(null)
      await createUserWithEmailAndPassword(auth, email, password)
    } catch (error: any) {
      console.error('Sign up error:', error)
      setError(error.message)
      throw error
    }
  }

  const signInWithGoogle = async () => {
    try {
      setError(null)
      const provider = new GoogleAuthProvider()
      await signInWithPopup(auth, provider)
    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const logout = async () => {
    try {
      setError(null)
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