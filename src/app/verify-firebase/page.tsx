'use client'

import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, Copy } from 'lucide-react'

export default function VerifyFirebasePage() {
    const [config, setConfig] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const [testResult, setTestResult] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

    useEffect(() => {
        const checkConfig = async () => {
            try {
                const { initializeFirebase } = await import('@/lib/firebase')
                await initializeFirebase()

                const { getApp } = await import('firebase/app')
                const app = getApp()
                setConfig(app.options)
                setTestResult('success')
            } catch (err: any) {
                setError(err.message)
                setTestResult('error')
            }
        }

        setTestResult('testing')
        checkConfig()
    }, [])

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text)
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-2">Firebase Configuration Verification</h1>
                <p className="text-gray-600 mb-8">Use this page to verify your Firebase configuration and diagnose authentication issues.</p>

                {/* Test Result */}
                <div className={`p-4 rounded-lg mb-6 ${testResult === 'success' ? 'bg-green-50 border border-green-200' :
                        testResult === 'error' ? 'bg-red-50 border border-red-200' :
                            'bg-blue-50 border border-blue-200'
                    }`}>
                    <div className="flex items-center gap-2 font-medium mb-2">
                        {testResult === 'success' && <CheckCircle className="text-green-600" size={20} />}
                        {testResult === 'error' && <AlertCircle className="text-red-600" size={20} />}
                        <span className={
                            testResult === 'success' ? 'text-green-800' :
                                testResult === 'error' ? 'text-red-800' :
                                    'text-blue-800'
                        }>
                            {testResult === 'testing' && 'Testing Firebase Connection...'}
                            {testResult === 'success' && 'Firebase Initialized Successfully'}
                            {testResult === 'error' && 'Firebase Initialization Failed'}
                            {testResult === 'idle' && 'Waiting...'}
                        </span>
                    </div>
                    {error && (
                        <div className="text-sm text-red-700 bg-red-100 p-3 rounded mt-2 font-mono break-all">
                            {error}
                        </div>
                    )}
                </div>

                {/* Current Configuration */}
                {config && (
                    <div className="bg-white rounded-lg shadow p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">Current Firebase Configuration</h2>
                        <div className="space-y-3">
                            {Object.entries(config).map(([key, value]) => (
                                <div key={key} className="flex items-start gap-2">
                                    <div className="flex-1">
                                        <div className="text-sm font-medium text-gray-600">{key}</div>
                                        <div className="font-mono text-sm bg-gray-50 p-2 rounded mt-1 break-all">
                                            {key === 'apiKey' ? `${String(value).slice(0, 10)}...${String(value).slice(-4)}` : String(value)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => copyToClipboard(String(value))}
                                        className="p-2 hover:bg-gray-100 rounded"
                                        title="Copy to clipboard"
                                    >
                                        <Copy size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Instructions */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-bold mb-4">How to Fix This Issue</h2>
                    <div className="space-y-4 text-sm">
                        <div>
                            <h3 className="font-bold mb-2">Step 1: Access Firebase Console</h3>
                            <p className="text-gray-600">Go to <a href="https://console.firebase.google.com" target="_blank" className="text-blue-600 underline">Firebase Console</a></p>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">Step 2: Select Your Project</h3>
                            <p className="text-gray-600">Select project: <code className="bg-gray-100 px-2 py-1 rounded">finleybook-6120d</code></p>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">Step 3: Get Web App Configuration</h3>
                            <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-4">
                                <li>Click the gear icon → Project Settings</li>
                                <li>Scroll to "Your apps" section</li>
                                <li>Find your Web app or click "Add app" → Web</li>
                                <li>Copy the firebaseConfig object</li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">Step 4: Check API Key Restrictions</h3>
                            <ol className="list-decimal list-inside text-gray-600 space-y-1 ml-4">
                                <li>Go to Google Cloud Console → APIs & Services → Credentials</li>
                                <li>Find "Browser key (auto created by Firebase)"</li>
                                <li>Under "Application restrictions", ensure "HTTP referrers" includes:
                                    <ul className="list-disc list-inside ml-6 mt-1">
                                        <li><code className="bg-gray-100 px-1 rounded">*.vercel.app/*</code></li>
                                        <li><code className="bg-gray-100 px-1 rounded">finleybook.vercel.app/*</code></li>
                                        <li><code className="bg-gray-100 px-1 rounded">localhost:*/*</code></li>
                                    </ul>
                                </li>
                            </ol>
                        </div>

                        <div>
                            <h3 className="font-bold mb-2">Step 5: Update Configuration</h3>
                            <p className="text-gray-600">Once you have the correct configuration, update <code className="bg-gray-100 px-2 py-1 rounded">src/lib/firebase.ts</code> with the new values.</p>
                        </div>
                    </div>
                </div>

                {/* Expected Configuration */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mt-6">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                        <AlertCircle className="text-yellow-600" />
                        Expected Configuration Format
                    </h2>
                    <pre className="bg-gray-900 text-green-400 p-4 rounded overflow-x-auto text-xs">
                        {`const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
  measurementId: "G-XXXXXXXXXX"
};`}
                    </pre>
                </div>
            </div>
        </div>
    )
}
