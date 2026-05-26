import { Fragment, useState, useEffect, useRef } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { XMarkIcon, MicrophoneIcon, StopIcon } from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { useAuth } from '@/components/AuthProvider'
import { addTransaction } from '@/lib/dataService'

interface VoiceInputModalProps {
  onClose: () => void
  onSuccess?: (data: any) => void
}

export default function VoiceInputModal({ onClose, onSuccess }: VoiceInputModalProps) {
  const { user } = useAuth()
  const [isRecording, setIsRecording] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [processing, setProcessing] = useState(false)
  const [parsedData, setParsedData] = useState<any>(null)

  const recognitionRef = useRef<any>(null)

  const confirmTransaction = async () => {
    if (!parsedData || !user) return

    try {
      setProcessing(true) // Reuse processing state for saving feedback

      await addTransaction({
        userId: user.uid,
        amount: parsedData.amount,
        category: parsedData.category,
        description: parsedData.description,
        date: new Date(parsedData.date),
        type: parsedData.type || 'expense',
        merchantName: parsedData.merchantName,
        emotionalTag: parsedData.emotional_context
      })

      toast.success('交易保存成功!')
      if (onSuccess) onSuccess(parsedData)
      onClose()
    } catch (error) {
      console.error('Save error:', error)
      toast.error('保存失败')
    } finally {
      setProcessing(false)
    }
  }

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'zh-CN' // Default to Chinese as per original demo, or make dynamic

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript
          }
        }
        if (finalTranscript) {
          setTranscript(prev => prev + finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error)
        setIsRecording(false)
        if (event.error === 'not-allowed') {
          toast.error('请允许麦克风权限以使用语音记账')
        }
      }

      recognitionRef.current.onend = () => {
        setIsRecording(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  const startRecording = () => {
    if (!recognitionRef.current) {
      toast.error('您的浏览器不支持语音识别')
      return
    }
    setTranscript('')
    setParsedData(null)
    setIsRecording(true)
    recognitionRef.current.start()
  }

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsRecording(false)
    }
  }

  const processTranscript = async () => {
    if (!transcript.trim()) return

    setProcessing(true)

    try {
      const token = await user?.getIdToken()
      if (!token) throw new Error('Not authenticated')

      const response = await fetch('/api/ai/parse-transaction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          input: transcript,
          currency: 'CNY' // Context dependent
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || '解析失败')
      }

      setParsedData(data.data)
      toast.success('AI 解析成功!')
    } catch (error: any) {
      console.error('Processing error:', error)
      toast.error(error.message || '语音解析失败，请重试')
    } finally {
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
                      语音记账
                    </Dialog.Title>

                    {/* Recording Controls */}
                    <div className="flex flex-col items-center space-y-6 mb-6">
                      <button
                        onClick={isRecording ? stopRecording : startRecording}
                        disabled={processing}
                        className={`flex items-center justify-center w-24 h-24 rounded-full transition-all ${isRecording
                          ? 'bg-danger-600 hover:bg-danger-700 animate-pulse'
                          : 'bg-primary-600 hover:bg-primary-700'
                          } text-white disabled:opacity-50`}
                      >
                        {isRecording ? (
                          <StopIcon className="h-8 w-8" />
                        ) : (
                          <MicrophoneIcon className="h-8 w-8" />
                        )}
                      </button>

                      <p className="text-sm text-gray-600 text-center">
                        {isRecording ? '正在录音...' : '点击开始语音记账'}
                      </p>

                      {isRecording && (
                        <div className="text-xs text-gray-500">
                          说出您的交易信息，例如："今天在星巴克买咖啡花了45元"
                        </div>
                      )}
                    </div>

                    {/* Transcript */}
                    {transcript && (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">语音转文字：</h4>
                        <p className="text-sm text-gray-700">"{transcript}"</p>
                      </div>
                    )}

                    {/* Processing */}
                    {processing && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-3"></div>
                          <span className="text-sm text-blue-800">
                            AI 正在解析交易信息...
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Parsed Data */}
                    {parsedData && (
                      <div className="bg-success-50 border border-success-200 rounded-lg p-4 mb-6">
                        <h4 className="text-sm font-medium text-success-800 mb-3">解析结果：</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-gray-600">金额：</span>
                            <span className="font-medium">¥{parsedData.amount}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">描述：</span>
                            <span className="font-medium">{parsedData.description}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">分类：</span>
                            <span className="font-medium">{parsedData.category}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">类型：</span>
                            <span className="font-medium">
                              {parsedData.type === 'expense' ? '支出' : '收入'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-600">日期：</span>
                            <span className="font-medium">{parsedData.date}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-col space-y-3">
                      {parsedData && (
                        <button
                          onClick={confirmTransaction}
                          className="btn-primary w-full"
                        >
                          确认添加交易
                        </button>
                      )}

                      {!isRecording && !processing && !parsedData && (
                        <div className="text-center text-sm text-gray-500">
                          <p className="mb-2">使用语音快速记账：</p>
                          <ul className="text-xs space-y-1">
                            <li>• "买了一杯咖啡花了30元"</li>
                            <li>• "收到工资8000元"</li>
                            <li>• "打车到机场花了80元"</li>
                          </ul>
                        </div>
                      )}

                      <button
                        onClick={onClose}
                        className="btn-secondary w-full"
                      >
                        {parsedData ? '取消' : '关闭'}
                      </button>
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