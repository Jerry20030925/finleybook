'use client'

import { AuthProvider } from '@/components/AuthProvider'
import { NotificationProvider } from '@/components/NotificationProvider'
import { SubscriptionProvider } from '@/components/SubscriptionProvider'
import { LanguageProvider } from '@/components/LanguageProvider'
import { CurrencyProvider } from '@/components/CurrencyProvider'
import { GlobalModalProvider } from '@/components/GlobalModalProvider'
import { Toaster } from 'react-hot-toast'
import ErrorBoundary from '@/components/ErrorBoundary'
import ConnectivityBanner from '@/components/ConnectivityBanner'
import { ExperienceProvider } from '@/components/ExperienceProvider'
import AuthenticatedRuntimeFeatures from '@/components/AuthenticatedRuntimeFeatures'

export function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <LanguageProvider>
            <ErrorBoundary>
                <AuthProvider>
                    <ExperienceProvider>
                        <NotificationProvider>
                            <CurrencyProvider>
                                <SubscriptionProvider>
                                    <GlobalModalProvider>
                                        <ConnectivityBanner />
                                        <AuthenticatedRuntimeFeatures />
                                        {children}
                                        <Toaster
                                            position="top-right"
                                            toastOptions={{
                                                duration: 4000,
                                                style: {
                                                    borderRadius: '14px',
                                                    background: '#fff',
                                                    color: '#1e293b',
                                                    fontSize: '14px',
                                                    fontWeight: 500,
                                                    boxShadow: '0 8px 30px rgba(0,0,0,0.08), 0 1px 3px rgba(0,0,0,0.06)',
                                                    border: '1px solid rgba(226,232,240,0.8)',
                                                    padding: '12px 16px',
                                                },
                                                success: {
                                                    iconTheme: { primary: '#10b981', secondary: '#fff' },
                                                },
                                                error: {
                                                    iconTheme: { primary: '#ef4444', secondary: '#fff' },
                                                },
                                            }}
                                            containerStyle={{ top: 72 }}
                                        />
                                    </GlobalModalProvider>
                                </SubscriptionProvider>
                            </CurrencyProvider>
                        </NotificationProvider>
                    </ExperienceProvider>
                </AuthProvider>
            </ErrorBoundary>
        </LanguageProvider>
    )
}
