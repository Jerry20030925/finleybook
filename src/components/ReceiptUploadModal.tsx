'use client'

import { Fragment, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CameraIcon, PhotoIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { OCRService } from '@/lib/services/ocrService'
import { useAuth } from '@/components/AuthProvider'
import { motion, AnimatePresence } from 'framer-motion'

interface ReceiptUploadModalProps {
  onClose: () => void
}

export default function ReceiptUploadModal({ onClose }: ReceiptUploadModalProps) {
  const [files, setFiles] = useState<File[]>([])
  const [uploading, setUploading] = useState(false)
  const [processing, setProcessing] = useState(false)
  const { user } = useAuth();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setFiles(prevFiles => [...prevFiles, ...acceptedFiles])
  }, [])

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true,
    noClick: true, // We will handle click manually for better mobile control
    noKeyboard: true
  })

  // Separate function for camera capture on mobile
  const handleCameraCapture = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(prev => [...prev, ...Array.from(e.target.files!)])
    }
  }

  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('Please select a file to upload')
      return
    }

    if (!user || !user.uid) {
      toast.error('Please sign in first')
      return
    }

    setUploading(true)
    setProcessing(true)

    try {
      const ocrService = OCRService.getInstance()
      let successfulUploads = 0

      for (const file of files) {
        try {
          const { transaction, document } = await ocrService.processReceiptImage(user.uid, file)
          console.log('Processed transaction:', transaction)
          // Here you would typically save the transaction and document to your database
          successfulUploads++
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError)
          toast.error(`Failed to process ${file.name}`)
        }
      }

      if (successfulUploads > 0) {
        toast.success(`Successfully processed ${successfulUploads} receipts!`)
      } else {
        toast.error('Failed to process receipts')
      }
      onClose()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('Receipt processing failed')
    } finally {
      setUploading(false)
      setProcessing(false)
    }
  }

  return (
    <Transition.Root show={true} as={Fragment}>
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
          <div className="fixed inset-0 bg-gray-900/90 transition-opacity backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-0 sm:p-4 text-center sm:items-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-full sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-t-2xl sm:rounded-2xl bg-white text-left shadow-2xl transition-all w-full sm:w-full sm:max-w-lg h-[85vh] sm:h-auto overflow-y-scroll sm:overflow-visible absolute bottom-0 sm:relative sm:bottom-auto">

                {/* Header */}
                <div className="relative p-6 border-b border-gray-100 bg-gray-50/50">
                  <div className="flex items-center justify-between">
                    <Dialog.Title as="h3" className="text-lg font-bold text-gray-900">
                      Scan Receipt
                    </Dialog.Title>
                    <button
                      type="button"
                      className="rounded-full p-1 bg-white hover:bg-gray-100 text-gray-400 hover:text-gray-500 transition-colors"
                      onClick={onClose}
                    >
                      <XMarkIcon className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Snap a photo or upload an image. AI will extract the details.
                  </p>
                </div>

                {/* Content */}
                <div className="p-6">
                  {/* Dropzone / Camera Area */}
                  {files.length === 0 ? (
                    <div
                      {...getRootProps()}
                      className={`relative overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300 ${isDragActive
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                        }`}
                    >
                      <input {...getInputProps()} />

                      <div className="px-6 py-12 text-center">
                        <div className="flex justify-center gap-4 mb-4">
                          {/* Mobile Camera Input Trigger */}
                          <label className="cursor-pointer group">
                            <input
                              type="file"
                              accept="image/*"
                              capture="environment"
                              className="hidden"
                              onChange={handleCameraCapture}
                            />
                            <div className="w-16 h-16 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center group-hover:bg-blue-200 transition-colors shadow-sm">
                              <CameraIcon className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-medium text-blue-600 mt-2 block">Camera</span>
                          </label>

                          {/* File Upload Trigger */}
                          <div onClick={open} className="cursor-pointer group">
                            <div className="w-16 h-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center group-hover:bg-purple-200 transition-colors shadow-sm">
                              <PhotoIcon className="w-8 h-8" />
                            </div>
                            <span className="text-xs font-medium text-purple-600 mt-2 block">Gallery</span>
                          </div>
                        </div>

                        <p className="text-sm text-gray-500 font-medium">
                          Tap to scan or select from gallery
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Supports JPG, PNG, GIF
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <AnimatePresence>
                          {files.map((file, index) => (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.9 }}
                              className="relative aspect-[3/4] bg-gray-100 rounded-xl overflow-hidden shadow-sm group"
                            >
                              <img
                                src={URL.createObjectURL(file)}
                                alt="Receipt preview"
                                className="w-full h-full object-cover"
                              />

                              {/* Scanning Animation Layer */}
                              {processing && (
                                <motion.div
                                  className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/30 to-transparent z-10"
                                  initial={{ top: '-100%' }}
                                  animate={{ top: '100%' }}
                                  transition={{
                                    repeat: Infinity,
                                    duration: 1.5,
                                    ease: "linear"
                                  }}
                                />
                              )}

                              <button
                                onClick={() => removeFile(index)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-black/70 rounded-full text-white backdrop-blur-sm transition-opacity opacity-0 group-hover:opacity-100"
                              >
                                <XMarkIcon className="w-4 h-4" />
                              </button>
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {/* Add More Button */}
                        {!processing && (
                          <div
                            onClick={open}
                            className="aspect-[3/4] rounded-xl border-2 border-dashed border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 hover:text-gray-500"
                          >
                            <PhotoIcon className="w-8 h-8 mb-2" />
                            <span className="text-xs font-medium">Add Page</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Processing Status */}
                  {processing && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-6 bg-blue-50/80 border border-blue-100 rounded-xl p-4 backdrop-blur-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-blue-500"></span>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-blue-900">Analyzing Receipt...</p>
                          <p className="text-xs text-blue-700">Extracting merchant, date, and amount</p>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Action Buttons */}
                  {!processing && files.length > 0 && (
                    <div className="mt-6 flex gap-3">
                      <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleUpload}
                        className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                      >
                        Scan & Process ({files.length})
                      </button>
                    </div>
                  )}

                  {/* Tips */}
                  <div className="mt-6 flex items-start gap-2 text-xs text-gray-400 px-2 pb-2">
                    <div className="mt-0.5">✨</div>
                    <p>Pro Tip: Ensure good lighting for best accuracy. Our AI will handle the rest.</p>
                  </div>

                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  )
}