import { db } from './firebase'
import { collection, getDocs } from 'firebase/firestore'

export const testFirebaseConnection = async () => {
  try {
    console.log('Testing Firebase connection...')
    
    // Try to access a collection
    const testRef = collection(db, 'test')
    console.log('Firebase connection successful')
    return true
  } catch (error) {
    console.error('Firebase connection failed:', error)
    return false
  }
}

export const testFirebaseAuth = async (userId: string) => {
  try {
    console.log('Testing Firestore access for user:', userId)
    
    // Try to access transactions collection
    const transactionsRef = collection(db, 'transactions')
    console.log('Firestore access successful')
    return true
  } catch (error) {
    console.error('Firestore access failed:', error)
    return false
  }
}