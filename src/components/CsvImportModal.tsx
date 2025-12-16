'use client'

import { Fragment, useState, useCallback, useEffect } from 'react'
import { Dialog, Transition, Switch } from '@headlessui/react'
import {
    XMarkIcon,
    DocumentArrowUpIcon,
    ArrowUpTrayIcon,
    TableCellsIcon,
    CheckCircleIcon,
    ExclamationTriangleIcon,
    TrashIcon,
    ArrowRightIcon,
    ArrowLeftIcon
} from '@heroicons/react/24/outline'
import { useLanguage } from './LanguageProvider'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import Papa from 'papaparse'
import { addTransactionsBatch, getUserTransactions, Transaction } from '@/lib/dataService'
import { useAuth } from './AuthProvider'
import confetti from 'canvas-confetti'
import { parse, isValid as isValidDateFn } from 'date-fns'

interface CsvImportModalProps {
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

type ImportStep = 'upload' | 'mapping' | 'review' | 'success'

interface ParsedRow {
    [key: string]: string
}

interface MappedTransaction {
    date: string
    description: string
    amount: number
    category: string
    originalRow: ParsedRow
    isDuplicate: boolean
    isValid: boolean
}

export default function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
    const { t } = useLanguage()
    const { user } = useAuth()
    const [step, setStep] = useState<ImportStep>('upload')
    const [file, setFile] = useState<File | null>(null)
    const [parsedData, setParsedData] = useState<ParsedRow[]>([])
    const [headers, setHeaders] = useState<string[]>([])

    // Mapping State
    const [mapping, setMapping] = useState({
        date: '',
        description: '',
        amount: '',
        category: ''
    })

    // Review State
    const [processedData, setProcessedData] = useState<MappedTransaction[]>([])
    const [skipDuplicates, setSkipDuplicates] = useState(true)
    const [isImporting, setIsImporting] = useState(false)
    const [existingTransactions, setExistingTransactions] = useState<Transaction[]>([])

    // Reset state on close
    useEffect(() => {
        if (!isOpen) {
            setTimeout(() => {
                setStep('upload')
                setFile(null)
                setParsedData([])
                setProcessedData([])
                setIsImporting(false)
            }, 300)
        }
    }, [isOpen])

    // Fetch existing transactions for deduplication
    useEffect(() => {
        if (user && isOpen) {
            getUserTransactions(user.uid, 500).then(setExistingTransactions)
        }
    }, [user, isOpen])

    // --- Step 1: Upload ---
    const onDrop = useCallback((acceptedFiles: File[]) => {
        if (acceptedFiles.length > 0) {
            const selectedFile = acceptedFiles[0]
            setFile(selectedFile)
            parseFile(selectedFile)
        }
    }, [])

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv'],
            'application/vnd.ms-excel': ['.csv'],
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    })

    const parseFile = async (file: File) => {
        if (file.type === 'application/pdf') {
            setIsImporting(true) // Reuse loading state
            const formData = new FormData()
            formData.append('file', file)

            try {
                const res = await fetch('/api/parse-statement', {
                    method: 'POST',
                    body: formData
                })

                if (!res.ok) {
                    if (res.status === 504) {
                        throw new Error('Server Timeout: The file is too large or complex to process. Try a smaller file or a CSV export.')
                    }
                    const errorData = await res.json().catch(() => ({}))
                    throw new Error(errorData.error || `Upload failed with status ${res.status}`)
                }

                const data = await res.json()

                // Transform to ParsedRow format
                // AI returns: { date, description, amount }
                // We'll use these as both keys and values for the "CSV" representation
                const rows = data.transactions.map((t: any) => ({
                    Date: t.date,
                    Description: t.description,
                    Amount: t.amount.toString(),
                    Category: t.category || 'Uncategorized'
                }))

                setParsedData(rows)
                setHeaders(['Date', 'Description', 'Amount', 'Category'])

                // Auto-map perfectly
                setMapping({
                    date: 'Date',
                    description: 'Description',
                    amount: 'Amount',
                    category: 'Category'
                })

                setStep('mapping')
                toast.success('Successfully parsed bank statement!')
            } catch (error: any) {
                console.error(error)
                toast.error(error.message || 'Could not parse PDF. Try using a CSV export instead.')
            } finally {
                setIsImporting(false)
            }
        } else {
            // CSV Logic
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    if (results.data && results.data.length > 0) {
                        setParsedData(results.data as ParsedRow[])
                        setHeaders(results.meta.fields || [])
                        autoDetectMapping(results.meta.fields || [])
                        setStep('mapping')
                    } else {
                        toast.error('Could not parse CSV file')
                    }
                },
                error: (error) => {
                    toast.error(`Error parsing CSV: ${error.message}`)
                }
            })
        }
    }

    // --- Step 2: Mapping ---
    const autoDetectMapping = (fields: string[]) => {
        const newMapping = { date: '', description: '', amount: '', category: '' }
        const lowerFields = fields.map(f => f.toLowerCase())

        // Helper to find field index
        const findField = (keywords: string[]) => {
            const index = lowerFields.findIndex(f => keywords.some(k => f.includes(k)))
            return index !== -1 ? fields[index] : ''
        }

        newMapping.date = findField(['date', 'time', 'day'])
        newMapping.description = findField(['desc', 'narrative', 'details', 'merchant'])
        newMapping.amount = findField(['amount', 'debit', 'value', 'cost'])
        newMapping.category = findField(['category', 'type', 'class'])

        setMapping(newMapping)

        // Load saved template if matches signature
        const signature = fields.join(',')
        const savedTemplate = localStorage.getItem(`csv_map_${signature}`)
        if (savedTemplate) {
            try {
                setMapping(JSON.parse(savedTemplate))
                toast.success('Loaded saved mapping template')
            } catch (e) { }
        }
    }

    const saveMappingTemplate = () => {
        const signature = headers.join(',')
        localStorage.setItem(`csv_map_${signature}`, JSON.stringify(mapping))
        toast.success('Mapping template saved')
    }

    const processMapping = () => {
        if (!mapping.date || !mapping.description || !mapping.amount) {
            toast.error('Please map all required fields')
            return
        }

        saveMappingTemplate()

        const processed = parsedData.map(row => {
            const rawDate = row[mapping.date]
            const rawDesc = row[mapping.description]
            const rawAmount = row[mapping.amount]

            // Parse Amount
            let amount = parseFloat(rawAmount?.replace(/[^0-9.-]/g, '') || '0')
            // Handle "Debit" columns where positive numbers are expenses (negative in our system)
            // For now, let's assume standard bank export: negative = expense, positive = income.
            // Some banks use "Debit" column (positive) and "Credit" column. This simple mapper assumes one Amount column.
            // Advanced: If amount is NaN, check if it's in (brackets)

            // Parse Date with Robust Handling
            // Support: DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD
            let parsedDate = new Date(rawDate)

            // If standard parsing fails or gives invalid date, try specific formats
            if (isNaN(parsedDate.getTime())) {
                const formatsToTry = [
                    'dd/MM/yyyy',
                    'd/M/yyyy',
                    'MM/dd/yyyy',
                    'M/d/yyyy',
                    'yyyy-MM-dd',
                    'dd-MM-yyyy'
                ]

                for (const fmt of formatsToTry) {
                    const d = parse(rawDate, fmt, new Date())
                    if (isValidDateFn(d)) {
                        parsedDate = d
                        break
                    }
                }
            }

            const isValidDate = !isNaN(parsedDate.getTime())

            const isValid = !isNaN(amount) && !!rawDate && isValidDate

            // Auto-categorize
            let category = 'Uncategorized'

            // 1. Use mapped category if available
            if (mapping.category && row[mapping.category]) {
                const mappedCat = row[mapping.category]
                // Normalize simple cases or trust the AI
                category = mappedCat
            } else {
                // 2. Fallback to client-side heuristic
                const descLower = rawDesc?.toLowerCase() || ''
                if (descLower.includes('woolworths') || descLower.includes('coles') || descLower.includes('aldi')) category = 'Groceries'
                else if (descLower.includes('uber') || descLower.includes('transport') || descLower.includes('opal')) category = 'Transport'
                else if (descLower.includes('netflix') || descLower.includes('spotify')) category = 'Entertainment'
                else if (descLower.includes('cafe') || descLower.includes('coffee') || descLower.includes('restaurant')) category = 'Food'
                else if (amount > 0) category = 'Income'
            }

            // Deduplication Check
            // Simple check: Date (string match) + Amount + Description (fuzzy)
            // Ideally we compare parsed dates, but string match is a safe first pass for exact dupes
            const isDuplicate = existingTransactions.some(t =>
                Math.abs(t.amount - amount) < 0.01 &&
                t.description.toLowerCase() === rawDesc?.toLowerCase()
                // Date comparison omitted for simplicity in client-side fuzzy match, 
                // as parsing formats vary wildly.
            )

            return {
                date: rawDate,
                description: rawDesc,
                amount,
                category,
                originalRow: row,
                isDuplicate,
                isValid
            }
        })

        setProcessedData(processed)
        setStep('review')
    }

    // --- Step 3: Review ---
    const handleImport = async () => {
        if (!user) return
        setIsImporting(true)

        try {
            const toImport = processedData.filter(t => t.isValid && (!skipDuplicates || !t.isDuplicate))

            if (toImport.length === 0) {
                toast.error('No valid transactions to import')
                setIsImporting(false)
                return
            }

            const transactionsToSave = toImport.map(t => ({
                userId: user.uid,
                amount: t.amount,
                category: t.category,
                description: t.description,
                date: new Date(t.date), // Note: This might need robust parsing library
                type: t.amount >= 0 ? 'income' as const : 'expense' as const
            }))

            await addTransactionsBatch(transactionsToSave)

            setIsImporting(false)
            setStep('success')
            confetti({
                particleCount: 150,
                spread: 70,
                origin: { y: 0.6 }
            })
            if (onSuccess) onSuccess()
        } catch (error) {
            console.error('Import failed:', error)
            toast.error('Import failed. Please try again.')
            setIsImporting(false)
        }
    }

    // --- Render Helpers ---
    const renderStepIndicator = () => (
        <div className="flex items-center justify-center mb-6 space-x-2">
            {['upload', 'mapping', 'review', 'success'].map((s, i) => (
                <div key={s} className={`h-2 w-2 rounded-full transition-colors ${step === s ? 'bg-blue-600 w-6' :
                    ['upload', 'mapping', 'review', 'success'].indexOf(step) > i ? 'bg-blue-200' : 'bg-gray-200'
                    }`} />
            ))}
        </div>
    )

    return (
        <Transition appear show={isOpen} as={Fragment}>
            <Dialog as="div" className="relative z-50" onClose={onClose}>
                <Transition.Child
                    as={Fragment}
                    enter="ease-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in duration-200"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                >
                    <div className="fixed inset-0 bg-black bg-opacity-25 backdrop-blur-sm" />
                </Transition.Child>

                <div className="fixed inset-0 overflow-y-auto">
                    <div className="flex min-h-full items-center justify-center p-4 text-center">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                                <div className="flex justify-between items-center mb-2">
                                    <Dialog.Title as="h3" className="text-lg font-bold leading-6 text-gray-900 flex items-center gap-2">
                                        <DocumentArrowUpIcon className="w-6 h-6 text-blue-600" />
                                        Import Bank Statement
                                    </Dialog.Title>
                                    <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                                        <XMarkIcon className="h-6 w-6" />
                                    </button>
                                </div>

                                {renderStepIndicator()}

                                {/* --- Step 1: Upload --- */}
                                {step === 'upload' && (
                                    <div className="mt-4">
                                        <div
                                            {...getRootProps()}
                                            className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all ${isDragActive ? 'border-blue-500 bg-blue-50 scale-[1.02]' : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                                }`}
                                        >
                                            <input {...getInputProps()} />
                                            <div className="flex flex-col items-center justify-center gap-4">
                                                <div className={`p-4 rounded-full ${isDragActive ? 'bg-blue-100' : 'bg-gray-100'}`}>
                                                    <ArrowUpTrayIcon className={`w-10 h-10 ${isDragActive ? 'text-blue-600' : 'text-gray-400'}`} />
                                                </div>
                                                <div>
                                                    <p className="text-lg font-medium text-gray-900">Drag and drop your bank statement here</p>
                                                    <p className="text-gray-500 mt-1">or click to browse files</p>
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-gray-400 mt-2 bg-gray-50 px-3 py-1.5 rounded-full">
                                                    <CheckCircleIcon className="w-4 h-4" />
                                                    Supported: CSV, Excel, PDF • CommBank, Westpac, NAB, ANZ
                                                </div>
                                                {isImporting && (
                                                    <div className="mt-4 flex items-center gap-2 text-blue-600">
                                                        <div className="animate-spin h-4 w-4 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                                                        <span className="text-sm font-medium">Parsing PDF with AI...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- Step 2: Mapping --- */}
                                {step === 'mapping' && (
                                    <div className="mt-4 space-y-6">
                                        <div className="bg-gray-50 rounded-lg p-4 overflow-x-auto">
                                            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">File Preview</h4>
                                            <table className="min-w-full text-xs text-left text-gray-500">
                                                <thead className="text-gray-700 bg-gray-100">
                                                    <tr>
                                                        {headers.map(h => <th key={h} className="px-3 py-2 font-medium">{h}</th>)}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {parsedData.slice(0, 3).map((row, i) => (
                                                        <tr key={i} className="border-b border-gray-100">
                                                            {headers.map(h => <td key={h} className="px-3 py-2 whitespace-nowrap">{row[h]}</td>)}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Date Column</label>
                                                <select
                                                    value={mapping.date}
                                                    onChange={e => setMapping({ ...mapping, date: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Column...</option>
                                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Description Column</label>
                                                <select
                                                    value={mapping.description}
                                                    onChange={e => setMapping({ ...mapping, description: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Column...</option>
                                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Amount Column</label>
                                                <select
                                                    value={mapping.amount}
                                                    onChange={e => setMapping({ ...mapping, amount: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Column...</option>
                                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Category Column (Optional)</label>
                                                <select
                                                    value={mapping.category}
                                                    onChange={e => setMapping({ ...mapping, category: e.target.value })}
                                                    className="w-full rounded-lg border-gray-300 text-gray-900 bg-white focus:ring-blue-500 focus:border-blue-500"
                                                >
                                                    <option value="">Select Column...</option>
                                                    {headers.map(h => <option key={h} value={h}>{h}</option>)}
                                                </select>
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                onClick={processMapping}
                                                className="flex items-center px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                            >
                                                Next: Review <ArrowRightIcon className="w-4 h-4 ml-2" />
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* --- Step 3: Review --- */}
                                {step === 'review' && (
                                    <div className="mt-4 flex flex-col h-[500px]">
                                        <div className="flex justify-between items-center mb-4">
                                            <div className="flex items-center gap-2">
                                                <Switch
                                                    checked={skipDuplicates}
                                                    onChange={setSkipDuplicates}
                                                    className={`${skipDuplicates ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none`}
                                                >
                                                    <span className={`${skipDuplicates ? 'translate-x-6' : 'translate-x-1'} inline-block h-4 w-4 transform rounded-full bg-white transition-transform`} />
                                                </Switch>
                                                <span className="text-sm text-gray-700">Skip duplicates</span>
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {processedData.filter(t => t.isValid && (!skipDuplicates || !t.isDuplicate)).length} transactions to import
                                            </div>
                                        </div>

                                        <div className="flex-1 overflow-y-auto border border-gray-200 rounded-lg">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                        <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {processedData.map((row, idx) => (
                                                        <tr key={idx} className={row.isDuplicate && skipDuplicates ? 'opacity-50 bg-gray-50' : ''}>
                                                            <td className="px-4 py-3 text-sm text-gray-900">{row.date}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-900 max-w-[200px] truncate" title={row.description}>{row.description}</td>
                                                            <td className="px-4 py-3 text-sm text-gray-500">
                                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                                                                    {row.category}
                                                                </span>
                                                            </td>
                                                            <td className={`px-4 py-3 text-sm text-right font-medium ${row.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                                {row.amount.toFixed(2)}
                                                            </td>
                                                            <td className="px-4 py-3 text-center">
                                                                {row.isDuplicate ? (
                                                                    <span className="text-yellow-600 text-xs flex items-center justify-center gap-1" title="Duplicate found">
                                                                        <ExclamationTriangleIcon className="w-4 h-4" />
                                                                        {skipDuplicates ? 'Skip' : 'Dupe'}
                                                                    </span>
                                                                ) : !row.isValid ? (
                                                                    <span className="text-red-600 text-xs" title="Invalid data">Error</span>
                                                                ) : (
                                                                    <CheckCircleIcon className="w-5 h-5 text-green-500 mx-auto" />
                                                                )}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>

                                        <div className="flex justify-between pt-4 mt-auto">
                                            <button
                                                onClick={() => setStep('mapping')}
                                                className="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center"
                                            >
                                                <ArrowLeftIcon className="w-4 h-4 mr-1" /> Back
                                            </button>
                                            <button
                                                onClick={handleImport}
                                                disabled={isImporting}
                                                className="flex items-center px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isImporting ? 'Importing...' : 'Import Transactions'}
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {/* --- Step 4: Success --- */}
                                {step === 'success' && (
                                    <div className="mt-8 text-center">
                                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                            <CheckCircleIcon className="w-10 h-10 text-green-600" />
                                        </div>
                                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h3>
                                        <p className="text-gray-500 mb-8">
                                            We've successfully processed your file and added the transactions to your account.
                                        </p>

                                        <div className="grid grid-cols-3 gap-4 mb-8">
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    {processedData.filter(t => t.isValid && (!skipDuplicates || !t.isDuplicate)).length}
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Transactions</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <div className="text-2xl font-bold text-gray-900">
                                                    ~2 hrs
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Time Saved</div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl">
                                                <div className="text-2xl font-bold text-green-600">
                                                    Done
                                                </div>
                                                <div className="text-xs text-gray-500 uppercase tracking-wide mt-1">Status</div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={onClose}
                                            className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition-colors"
                                        >
                                            Go to Transactions
                                        </button>
                                    </div>
                                )}

                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition >
    )
}
