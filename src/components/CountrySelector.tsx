'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Check } from 'lucide-react'

export interface Country {
  code: string
  name: string
  flag: string
  currency: string
  locale: string
}

const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', currency: 'USD', locale: 'en-US' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', currency: 'AUD', locale: 'en-AU' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', currency: 'CAD', locale: 'en-CA' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', currency: 'GBP', locale: 'en-GB' },
  { code: 'DE', name: 'Germany', flag: '🇩🇪', currency: 'EUR', locale: 'de-DE' },
  { code: 'FR', name: 'France', flag: '🇫🇷', currency: 'EUR', locale: 'fr-FR' },
  { code: 'JP', name: 'Japan', flag: '🇯🇵', currency: 'JPY', locale: 'ja-JP' },
  { code: 'CN', name: 'China', flag: '🇨🇳', currency: 'CNY', locale: 'zh-CN' },
  { code: 'IN', name: 'India', flag: '🇮🇳', currency: 'INR', locale: 'en-IN' },
  { code: 'BR', name: 'Brazil', flag: '🇧🇷', currency: 'BRL', locale: 'pt-BR' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', currency: 'SGD', locale: 'en-SG' },
  { code: 'NZ', name: 'New Zealand', flag: '🇳🇿', currency: 'NZD', locale: 'en-NZ' },
  { code: 'HK', name: 'Hong Kong', flag: '🇭🇰', currency: 'HKD', locale: 'en-HK' },
  { code: 'CH', name: 'Switzerland', flag: '🇨🇭', currency: 'CHF', locale: 'de-CH' },
  { code: 'NL', name: 'Netherlands', flag: '🇳🇱', currency: 'EUR', locale: 'nl-NL' },
]

interface CountrySelectorProps {
  selectedCountry?: Country
  onCountryChange?: (country: Country) => void
  className?: string
}

export default function CountrySelector({
  selectedCountry = COUNTRIES[1], // Default to Australia
  onCountryChange,
  className = ''
}: CountrySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCountries = COUNTRIES.filter(country =>
    country.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    country.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCountrySelect = (country: Country) => {
    onCountryChange?.(country)
    setIsOpen(false)
    setSearchQuery('')
  }

  return (
    <div className={`relative ${className}`}>
      {/* Selected Country Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white/50 hover:bg-white/70 backdrop-blur-sm border border-gray-200/50 rounded-full transition-all duration-200 text-sm font-medium text-gray-600 hover:text-gray-900"
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span className="hidden sm:inline">{selectedCountry.name}</span>
        <span className="sm:hidden">{selectedCountry.code}</span>
        <ChevronDown 
          size={16} 
          className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute top-full mt-2 right-0 w-80 bg-white rounded-2xl shadow-xl border border-gray-200/50 backdrop-blur-xl z-50 overflow-hidden"
            >
              {/* Search Header */}
              <div className="p-4 border-b border-gray-100">
                <input
                  type="text"
                  placeholder="Search countries..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  autoFocus
                />
              </div>

              {/* Country List */}
              <div className="max-h-64 overflow-y-auto">
                {filteredCountries.length > 0 ? (
                  filteredCountries.map((country) => (
                    <button
                      key={country.code}
                      onClick={() => handleCountrySelect(country)}
                      className={`w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors text-left group ${
                        selectedCountry.code === country.code ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{country.flag}</span>
                        <div>
                          <div className="font-medium text-gray-900">{country.name}</div>
                          <div className="text-xs text-gray-500">{country.currency} • {country.code}</div>
                        </div>
                      </div>
                      {selectedCountry.code === country.code && (
                        <Check size={16} className="text-indigo-600" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-8 text-center text-gray-500 text-sm">
                    No countries found matching "{searchQuery}"
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 text-xs text-gray-500 text-center border-t border-gray-100">
                Select your country for localized currency and formatting
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Hook to use country context
export function useCountry() {
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[1]) // Default to Australia

  const updateCountry = (country: Country) => {
    setSelectedCountry(country)
    // Save to localStorage for persistence
    if (typeof window !== 'undefined') {
      localStorage.setItem('finleybook-country', JSON.stringify(country))
    }
  }

  // Load from localStorage on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('finleybook-country')
      if (saved) {
        try {
          const country = JSON.parse(saved)
          if (COUNTRIES.find(c => c.code === country.code)) {
            setSelectedCountry(country)
          }
        } catch (error) {
          console.warn('Failed to parse saved country:', error)
        }
      }
    }
  })

  return {
    selectedCountry,
    updateCountry,
    formatCurrency: (amount: number) => {
      try {
        return new Intl.NumberFormat(selectedCountry.locale, {
          style: 'currency',
          currency: selectedCountry.currency,
        }).format(amount)
      } catch (error) {
        return `${selectedCountry.currency} ${amount.toFixed(2)}`
      }
    },
    countries: COUNTRIES
  }
}