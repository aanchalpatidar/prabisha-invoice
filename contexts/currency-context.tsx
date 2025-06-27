"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Currency = "USD" | "GBP" | "INR"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
  convertCurrency: (amountInINR: number) => number
  rate: number
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencyConfig = {
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  INR: { symbol: "₹", locale: "en-IN" },
}

const staticRates = {
  INR: 1,
  USD: 0.012, // 1 INR = 0.012 USD (example)
  GBP: 0.0095, // 1 INR = 0.0095 GBP (example)
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("INR")

  useEffect(() => {
    const saved = localStorage.getItem("preferred-currency") as Currency
    if (saved && ["USD", "GBP", "INR"].includes(saved)) {
      setCurrency(saved)
    }
  }, [])

  const handleSetCurrency = (newCurrency: Currency) => {
    setCurrency(newCurrency)
    localStorage.setItem("preferred-currency", newCurrency)
  }

  // Convert from INR to selected currency
  const convertCurrency = (amountInINR: number) => {
    const rate = staticRates[currency]
    return amountInINR * rate
  }

  const formatCurrency = (amountInINR: number) => {
    const converted = convertCurrency(amountInINR)
    const config = currencyConfig[currency]
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
    }).format(converted)
  }

  const getCurrencySymbol = () => currencyConfig[currency].symbol

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatCurrency,
        getCurrencySymbol,
        convertCurrency,
        rate: staticRates[currency],
      }}
    >
      {children}
    </CurrencyContext.Provider>
  )
}

export function useCurrency() {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
