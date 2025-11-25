'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { addTransaction, getUserTransactions } from '@/lib/dataService'
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'

export default function DebugPage() {
  const { user } = useAuth()
  const [testResult, setTestResult] = useState('')
  const [transactions, setTransactions] = useState<any[]>([])

  const testFirebaseConnection = async () => {
    try {
      setTestResult('Testing Firebase connection...')
      
      if (!user?.uid) {
        setTestResult('Error: No user logged in')
        return
      }

      // Test 1: Try to add a simple document directly
      setTestResult('Test 1: Adding document directly to Firebase...')
      
      const testDoc = await addDoc(collection(db, 'transactions'), {
        userId: user.uid,
        amount: 100,
        category: '测试分类',
        description: '测试交易',
        date: new Date(),
        type: 'expense',
        paymentMethod: 'Cash',
        createdAt: new Date()
      })
      
      setTestResult(prev => prev + `\nTest 1 SUCCESS: Document added with ID: ${testDoc.id}`)
      
      // Test 2: Try to read the documents
      setTestResult(prev => prev + `\nTest 2: Reading transactions...`)
      
      const q = query(
        collection(db, 'transactions'),
        where('userId', '==', user.uid)
      )
      
      const snapshot = await getDocs(q)
      setTestResult(prev => prev + `\nTest 2 SUCCESS: Found ${snapshot.docs.length} transactions`)
      
      const docs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
      
      setTransactions(docs)
      
      // Test 3: Try using our data service
      setTestResult(prev => prev + `\nTest 3: Using data service...`)
      
      const serviceTransactions = await getUserTransactions(user.uid)
      setTestResult(prev => prev + `\nTest 3 SUCCESS: Data service returned ${serviceTransactions.length} transactions`)
      
    } catch (error: any) {
      setTestResult(prev => prev + `\nERROR: ${error.message}`)
      console.error('Debug test error:', error)
    }
  }

  const testAddTransaction = async () => {
    try {
      if (!user?.uid) {
        setTestResult('Error: No user logged in')
        return
      }

      setTestResult('Testing addTransaction function...')
      
      const transactionData = {
        userId: user.uid,
        amount: 50,
        category: '餐饮美食',
        description: '测试餐厅',
        date: new Date(),
        type: 'expense' as const,
        paymentMethod: 'Cash'
      }
      
      const result = await addTransaction(transactionData)
      setTestResult(prev => prev + `\naddTransaction SUCCESS: ${result}`)
      
    } catch (error: any) {
      setTestResult(prev => prev + `\naddTransaction ERROR: ${error.message}`)
      console.error('addTransaction test error:', error)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Debug Page</h1>
          <p>Please log in to use debug tools.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
      
      <div className="mb-8">
        <p><strong>User ID:</strong> {user.uid}</p>
        <p><strong>User Email:</strong> {user.email}</p>
      </div>
      
      <div className="space-y-4 mb-8">
        <button
          onClick={testFirebaseConnection}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Test Firebase Connection
        </button>
        
        <button
          onClick={testAddTransaction}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ml-4"
        >
          Test Add Transaction
        </button>
      </div>
      
      <div className="mb-8">
        <h3 className="text-xl font-bold mb-4">Test Results:</h3>
        <pre className="bg-gray-100 p-4 rounded whitespace-pre-wrap text-sm">
          {testResult || 'No tests run yet'}
        </pre>
      </div>
      
      <div>
        <h3 className="text-xl font-bold mb-4">Transactions Found:</h3>
        <div className="space-y-2">
          {transactions.length === 0 ? (
            <p>No transactions found</p>
          ) : (
            transactions.map((transaction) => (
              <div key={transaction.id} className="bg-white p-4 border rounded">
                <p><strong>ID:</strong> {transaction.id}</p>
                <p><strong>Amount:</strong> ¥{transaction.amount}</p>
                <p><strong>Category:</strong> {transaction.category}</p>
                <p><strong>Description:</strong> {transaction.description}</p>
                <p><strong>Type:</strong> {transaction.type}</p>
                <p><strong>Date:</strong> {transaction.date?.toString()}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}