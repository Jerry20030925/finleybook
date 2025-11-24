'use client'

import { Fragment, useState, useCallback } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, CloudArrowUpIcon } from '@heroicons/react/24/outline'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'
import { OCRService } from '@/lib/services/ocrService'
import { useAuth } from '@/components/AuthProvider'

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

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    multiple: true
  })

  const removeFile = (index: number) => {
    setFiles(files => files.filter((_, i) => i !== index))
  }

  const handleUpload = async () => {
    if (files.length === 0) {
      toast.error('请选择要上传的文件')
      return
    }

    if (!user || !user.uid) {
      toast.error('用户未登录，请先登录')
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
          console.log('Processed document:', document)
          // Here you would typically save the transaction and document to your database
          // For now, we just log them
          successfulUploads++
        } catch (fileError) {
          console.error(`Error processing file ${file.name}:`, fileError)
          toast.error(`处理文件 ${file.name} 失败`)
        }
      }
      
      if (successfulUploads > 0) {
        toast.success(`成功处理 ${successfulUploads} 张票据！`)
      } else {
        toast.error('所有票据处理失败')
      }
      onClose()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error('票据处理失败')
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
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 w-screen overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500"
                    onClick={onClose}
                  >
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="w-full mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900 mb-6">
                      上传票据
                    </Dialog.Title>

                    {/* Upload Area */}
                    <div
                      {...getRootProps()}
                      className={`mt-4 flex justify-center rounded-lg border border-dashed px-6 py-10 ${
                        isDragActive ? 'border-primary-400 bg-primary-50' : 'border-gray-300'
                      }`}
                    >
                      <div className="text-center">
                        <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-300" />
                        <div className="mt-4 flex text-sm leading-6 text-gray-600">
                          <label className="relative cursor-pointer rounded-md bg-white font-semibold text-primary-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-primary-600 focus-within:ring-offset-2 hover:text-primary-500">
                            <span>上传文件</span>
                            <input {...getInputProps()} />
                          </label>
                          <p className="pl-1">或拖拽到这里</p>
                        </div>
                        <p className="text-xs leading-5 text-gray-600">
                          支持 PNG, JPG, GIF 格式
                        </p>
                      </div>
                    </div>

                    {/* File List */}
                    {files.length > 0 && (
                      <div className="mt-6">
                        <h4 className="text-sm font-medium text-gray-900 mb-3">
                          已选择的文件 ({files.length})
                        </h4>
                        <div className="space-y-2 max-h-40 overflow-y-auto">
                          {files.map((file, index) => (
                            <div key={index} className="flex items-center justify-between bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center space-x-3">
                                <div className="flex-shrink-0">
                                  {file.type.startsWith('image/') && (
                                    <img
                                      src={URL.createObjectURL(file)}
                                      alt="Preview"
                                      className="h-10 w-10 rounded-lg object-cover"
                                    />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => removeFile(index)}
                                className="text-danger-600 hover:text-danger-700"
                              >
                                <XMarkIcon className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Processing Status */}
                    {processing && (
                      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-sm text-blue-800">
                            正在使用 OCR 技术识别票据信息...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="mt-6 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                      <button
                        onClick={handleUpload}
                        disabled={uploading || files.length === 0}
                        className="btn-primary flex-1 disabled:opacity-50"
                      >
                        {uploading ? '处理中...' : `开始处理 (${files.length})`}
                      </button>
                      <button
                        onClick={onClose}
                        className="btn-secondary flex-1"
                      >
                        取消
                      </button>
                    </div>

                    {/* Help Text */}
                    <div className="mt-4 text-xs text-gray-500">
                      <p className="mb-1">提示：</p>
                      <ul className="list-disc list-inside space-y-1">
                        <li>确保票据图片清晰，文字可见</li>
                        <li>系统会自动识别金额、日期、商家等信息</li>
                        <li>识别完成后您可以编辑和确认信息</li>
                      </ul>
                    </div>
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