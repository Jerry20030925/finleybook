'use client'

import { useState } from 'react'
import { UploadCloud, CheckCircle, AlertCircle, FileSpreadsheet, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

export default function AdminDashboard() {
    const [file, setFile] = useState<File | null>(null)
    const [merchantId, setMerchantId] = useState('')
    const [uploading, setUploading] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string, details?: any } | null>(null)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0])
            setStatus(null)
        }
    }

    const handleUpload = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!file || !merchantId) return

        setUploading(true)
        setStatus(null)

        const formData = new FormData()
        formData.append('file', file)
        formData.append('merchantId', merchantId)

        try {
            const res = await fetch('/api/admin/upload-report', {
                method: 'POST',
                body: formData,
            })

            const data = await res.json()

            if (res.ok) {
                setStatus({
                    type: 'success',
                    message: `Successfully processed ${data.processed} rows with ${data.errors} errors.`
                })
                // Reset form
                setFile(null)
            } else {
                setStatus({
                    type: 'error',
                    message: data.error || 'Upload failed'
                })
            }
        } catch (error) {
            setStatus({ type: 'error', message: 'Network error occurred' })
        } finally {
            setUploading(false)
        }
    }

    return (
        <div>
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Operations Dashboard</h1>
                <p className="text-gray-500 mt-2">Upload partner reports to reconcile cashback transactions.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Upload Card */}
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                            <UploadCloud size={24} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Upload CSV Report</h2>
                    </div>

                    <form onSubmit={handleUpload} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Merchant Partner</label>
                            <select
                                value={merchantId}
                                onChange={(e) => setMerchantId(e.target.value)}
                                className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white text-gray-900"
                                required
                            >
                                <option value="" disabled>Select a Merchant</option>
                                <option value="Amazon">Amazon Associates</option>
                                <option value="Skimlinks">Skimlinks</option>
                                <option value="Rakuten">Rakuten Advertising</option>
                                <option value="Impact">Impact Radius</option>
                                <option value="CJ">CJ Affiliate</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Report File (CSV)</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
                                <input
                                    type="file"
                                    accept=".csv"
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                                {file ? (
                                    <div className="flex flex-col items-center text-indigo-600">
                                        <FileSpreadsheet size={32} className="mb-2" />
                                        <span className="font-bold">{file.name}</span>
                                        <span className="text-sm text-gray-500">{(file.size / 1024).toFixed(1)} KB</span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <UploadCloud size={32} className="mb-2" />
                                        <span className="font-medium">Drag & Drop or Click to Select</span>
                                        <span className="text-xs mt-1">Supports standard CSV formats</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={!file || !merchantId || uploading}
                            className={`w-full py-4 rounded-xl font-bold text-white flex items-center justify-center gap-2 transition-all ${!file || !merchantId || uploading
                                    ? 'bg-gray-300 cursor-not-allowed'
                                    : 'bg-indigo-600 hover:bg-indigo-700 shadow-lg hover:shadow-indigo-500/30'
                                }`}
                        >
                            {uploading ? (
                                <>
                                    <Loader2 className="animate-spin" /> Processing...
                                </>
                            ) : (
                                <>
                                    Process Report
                                </>
                            )}
                        </button>
                    </form>

                    <AnimatePresence>
                        {status && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0 }}
                                className={`mt-6 p-4 rounded-xl flex items-start gap-3 ${status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                                    }`}
                            >
                                {status.type === 'success' ? <CheckCircle className="shrink-0" /> : <AlertCircle className="shrink-0" />}
                                <div>
                                    <p className="font-bold">{status.type === 'success' ? 'Success' : 'Error'}</p>
                                    <p className="text-sm">{status.message}</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Instructions */}
                <div className="bg-slate-50 p-8 rounded-2xl border border-slate-200">
                    <h3 className="text-lg font-bold text-slate-800 mb-4">Required CSV Format</h3>
                    <div className="space-y-4 text-sm text-slate-600">
                        <p>Ensure your CSV contains the following columns (case-insensitive):</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li><strong className="text-slate-900">Subtag / CustomID</strong>: The Transaction ID linking to the user.</li>
                            <li><strong className="text-slate-900">Commission / Earnings</strong>: The amount earned.</li>
                            <li><strong className="text-slate-900">Status</strong>: e.g., "Pending", "Approved", "Declined".</li>
                            <li><strong className="text-slate-900">Order ID</strong> (Optional): Merchant order reference.</li>
                        </ul>

                        <div className="mt-6 pt-6 border-t border-slate-200">
                            <h4 className="font-bold text-slate-800 mb-2">Supported Platforms</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono">Amazon</span>
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono">Impact</span>
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono">CJ</span>
                                <span className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-mono">Rakuten</span>
                            </div>
                        </div>

                        <div className="mt-4 p-4 bg-yellow-50 text-yellow-800 rounded-lg text-xs leading-relaxed">
                            <strong>Note:</strong> Uploading the same Report ID multiple times will update the status of existing transactions. It will not create duplicates if the Trip ID matches.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
