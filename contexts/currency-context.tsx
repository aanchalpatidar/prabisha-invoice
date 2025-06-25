"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

export type Currency = "USD" | "GBP" | "INR"

interface CurrencyContextType {
  currency: Currency
  setCurrency: (currency: Currency) => void
  formatCurrency: (amount: number) => string
  getCurrencySymbol: () => string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const currencyConfig = {
  USD: { symbol: "$", locale: "en-US" },
  GBP: { symbol: "£", locale: "en-GB" },
  INR: { symbol: "₹", locale: "en-IN" },
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<Currency>("USD")

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

  const formatCurrency = (amount: number) => {
    const config = currencyConfig[currency]
    return new Intl.NumberFormat(config.locale, {
      style: "currency",
      currency: currency,
    }).format(amount)
  }

  const getCurrencySymbol = () => currencyConfig[currency].symbol

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency: handleSetCurrency,
        formatCurrency,
        getCurrencySymbol,
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
