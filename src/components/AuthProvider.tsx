'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { initializeFirebase } from '@/lib/firebase'
import PageLoader from './PageLoader'
import { useSearchParams } from 'next/navigation'

interface AuthContextType {
  user: any | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<any>
  signUp: (email: string, password: string) => Promise<any>
  signInWithGoogle: () => Promise<any>
  signInWithPhone: (phoneNumber: string, appVerifier: any) => Promise<any>
  loginAsGuest: () => Promise<any>
  sendPasswordReset: (email: string) => Promise<void>
  logout: () => Promise<void>
  auth: any
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

          const { onAuthStateChanged, getRedirectResult } = await import('firebase/auth')

          // Subscribe to auth state changes immediately
          // Subscribe to auth state changes immediately
          const unsubscribe = onAuthStateChanged(firebase.auth, (firebaseUser) => {
            if (mounted) {
              clearTimeout(timeoutId)

              if (firebaseUser) {
                // Subscribe to user document for real-time updates (subscription status, etc.)
                import('firebase/firestore').then(({ doc, onSnapshot, setDoc, serverTimestamp }) => {
                  const userRef = doc(firebase.db, 'users', firebaseUser.uid)

                  // Update lastLogin
                  // Update lastLogin and Streak logic safely
                  import('@/lib/streakService').then(({ updateUserStreak }) => {
                    updateUserStreak(firebaseUser.uid).catch(console.error)
                  })

                  // Ensure basic profile info is sync'd but DON'T touch lastLogin here to avoid race conditions
                  setDoc(userRef, {
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                  }, { merge: true }).catch(console.error)

                  // Listen for profile changes
                  const profileUnsubscribe = onSnapshot(userRef, (doc) => {
                    const profileData = doc.data()
                    // Merge profile data into user object but preserve methods
                    const mergedUser = { ...firebaseUser, ...profileData }
                    // Re-attach critical Firebase User methods
                    mergedUser.getIdToken = firebaseUser.getIdToken.bind(firebaseUser)
                    mergedUser.reload = firebaseUser.reload.bind(firebaseUser)

                    setUser(mergedUser)
                    setLoading(false)
                  })

                  // Store unsubscribe function to clean up later if needed
                  // Note: We can't easily clean this up inside this callback, 
                  // but it will be cleaned up when the component unmounts via the main unsubscribe
                })
              } else {
                setUser(null)
                setLoading(false)
              }

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

          // Handle redirect result for Google OAuth (non-blocking if possible, but we await it here to check new user)
          try {
            const result = await getRedirectResult(firebase.auth)
            if (result) {
              // Check for new user
              const isNewUser = (result as any)._tokenResponse?.isNewUser ||
                result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

              if (isNewUser) {
                await trackReferral(result.user.uid)
                // Send Welcome Email
                fetch('/api/email/welcome', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ email: result.user.email, name: result.user.displayName }),
                }).catch(console.error)
              }
            }
          } catch (error: any) {
            console.error('Redirect result error:', error)
            // Don't set global error here as it might block the UI, just log it
          }

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
      return await signInWithEmailAndPassword(auth, email, password)
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

      // Send Welcome Email
      // Send Welcome Email (await to ensure it sends before redirect)
      await fetch('/api/email/welcome', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name: email.split('@')[0] }),
      }).catch(err => console.error('Failed to send welcome email:', err))

      return userCredential
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
      const { GoogleAuthProvider, signInWithPopup, RecaptchaVerifier, signInWithPhoneNumber } = await import('firebase/auth')
      const provider = new GoogleAuthProvider()

      // Add custom parameters for better UX
      provider.setCustomParameters({
        prompt: 'select_account',
        hd: '' // Allow any domain
      })

      // Use popup method which is often more reliable for desktop and avoids page reloads
      const result = await signInWithPopup(auth, provider)

      // Check for new user
      const isNewUser = (result as any)._tokenResponse?.isNewUser ||
        result.user.metadata.creationTime === result.user.metadata.lastSignInTime;

      if (isNewUser) {
        await trackReferral(result.user.uid)
        // Send Welcome Email
        fetch('/api/email/welcome', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: result.user.email, name: result.user.displayName }),
        }).catch(console.error)
      }
      return result

    } catch (error: any) {
      console.error('Google sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const signInWithPhone = async (phoneNumber: string, appVerifier: any) => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized (Check console for details)'
      console.error('SignInWithPhone blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      const { signInWithPhoneNumber } = await import('firebase/auth')
      const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, appVerifier)
      return confirmationResult
    } catch (error: any) {
      console.error('Phone sign in error:', error)
      setError(error.message)
      throw error
    }
  }

  const loginAsGuest = async () => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized'
      console.error('Guest login blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      const { signInAnonymously } = await import('firebase/auth')
      const result = await signInAnonymously(auth)
      return result
    } catch (error: any) {
      console.error('Guest login error:', error)
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

  const sendPasswordReset = async (email: string) => {
    if (!auth) {
      const errorMsg = error || 'Auth not initialized (Check console for details)'
      console.error('SendPasswordReset blocked:', errorMsg)
      throw new Error(errorMsg)
    }
    try {
      setError(null)
      // Use our custom API for professional emails
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to send reset email')
      }
    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message)
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      error,
      signIn,
      signUp,
      signInWithGoogle,
      signInWithPhone,
      loginAsGuest,
      sendPasswordReset,
      logout,
      auth
    }}>
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